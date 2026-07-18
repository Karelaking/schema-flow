// =============================================================================
// AI DB Architect Agent — Universal Provider Client
// =============================================================================
//
// Adapter layer that normalizes API calls across multiple AI providers.
// Defaults to OpenRouter with free models. Supports streaming & tool calls.
// =============================================================================

import type { AIProvider, ToolCall } from "./types";
import { SCHEMA_TOOLS, type ToolDefinition } from "./tools";

// ---------------------------------------------------------------------------
// Provider Endpoint Configuration
// ---------------------------------------------------------------------------

const PROVIDER_ENDPOINTS: Record<Exclude<AIProvider, "custom">, string> = {
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  gemini: "https://generativelanguage.googleapis.com/v1beta",
  claude: "https://api.anthropic.com/v1/messages",
  openai: "https://api.openai.com/v1/chat/completions",
};

// ---------------------------------------------------------------------------
// Message Formats
// ---------------------------------------------------------------------------

interface ProviderMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface StreamChunk {
  type: "text" | "tool_call" | "done" | "error";
  content?: string;
  toolCall?: ToolCall;
  error?: string;
}

// ---------------------------------------------------------------------------
// Request Builder
// ---------------------------------------------------------------------------

interface ChatRequestParams {
  provider: AIProvider;
  model: string;
  apiKey: string;
  messages: ProviderMessage[];
  tools?: ToolDefinition[];
  customEndpoint?: string;
}

/**
 * Builds fetch options for the target provider.
 * All providers use the OpenAI-compatible format (OpenRouter, OpenAI, custom).
 * Gemini and Claude require translation at the API route level.
 */
function buildRequest(params: ChatRequestParams): { url: string; init: RequestInit } {
  const { provider, model, apiKey, messages, tools, customEndpoint } = params;

  // Default to OpenAI-compatible format (works for OpenRouter, OpenAI, custom endpoints)
  const url = provider === "custom"
    ? `${customEndpoint}/chat/completions`
    : PROVIDER_ENDPOINTS[provider];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Provider-specific auth headers
  switch (provider) {
    case "openrouter":
      headers["Authorization"] = `Bearer ${apiKey}`;
      headers["HTTP-Referer"] = "https://schema-flow.dev";
      headers["X-Title"] = "Schema Flow - DB Architect";
      break;
    case "claude":
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
      break;
    case "openai":
    case "custom":
      headers["Authorization"] = `Bearer ${apiKey}`;
      break;
    case "gemini":
      // Gemini uses query param for key; handled in URL construction
      break;
  }

  // Build request body based on provider
  let body: Record<string, unknown>;

  if (provider === "claude") {
    // Anthropic format
    const systemMsg = messages.find((m) => m.role === "system");
    const nonSystemMsgs = messages.filter((m) => m.role !== "system");

    body = {
      model,
      max_tokens: 4096,
      system: systemMsg?.content ?? "",
      messages: nonSystemMsgs.map((m) => ({
        role: m.role === "tool" ? "user" : m.role,
        content: m.role === "tool"
          ? `[Tool Result for ${m.tool_call_id}]: ${m.content}`
          : m.content,
      })),
      stream: true,
    };

    if (tools && tools.length > 0) {
      body.tools = tools.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters,
      }));
    }
  } else if (provider === "gemini") {
    // Gemini REST format
    const systemMsg = messages.find((m) => m.role === "system");
    const nonSystemMsgs = messages.filter((m) => m.role !== "system");

    body = {
      system_instruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
      contents: nonSystemMsgs.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 4096 },
    };

    if (tools && tools.length > 0) {
      body.tools = [{
        function_declarations: tools.map((t) => ({
          name: t.function.name,
          description: t.function.description,
          parameters: t.function.parameters,
        })),
      }];
    }
  } else {
    // OpenAI-compatible format (OpenRouter, OpenAI, custom)
    body = {
      model,
      messages: messages.map((m) => {
        const msg: Record<string, unknown> = { role: m.role, content: m.content };
        if (m.tool_calls) msg.tool_calls = m.tool_calls;
        if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
        return msg;
      }),
      stream: true,
      max_tokens: 4096,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
      body.tool_choice = "auto";
    }
  }

  let finalUrl = url;
  if (provider === "gemini") {
    finalUrl = `${PROVIDER_ENDPOINTS.gemini}/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  }

  return {
    url: finalUrl,
    init: {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  };
}

// ---------------------------------------------------------------------------
// Stream Parser — OpenAI SSE Format (used by OpenRouter, OpenAI, custom)
// ---------------------------------------------------------------------------

/**
 * Parses an OpenAI-compatible SSE stream and yields structured chunks.
 */
export async function* parseOpenAIStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<StreamChunk> {
  const decoder = new TextDecoder();
  let buffer = "";
  const toolCallAccumulator = new Map<number, { id: string; name: string; args: string }>();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") {
        // Flush accumulated tool calls
        for (const [, tc] of toolCallAccumulator) {
          yield {
            type: "tool_call",
            toolCall: {
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: tc.args },
            },
          };
        }
        yield { type: "done" };
        return;
      }

      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta;

        if (!delta) continue;

        // Text content
        if (delta.content) {
          yield { type: "text", content: delta.content };
        }

        // Tool calls (streamed incrementally)
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            if (!toolCallAccumulator.has(idx)) {
              toolCallAccumulator.set(idx, {
                id: tc.id ?? `tc-${idx}`,
                name: tc.function?.name ?? "",
                args: "",
              });
            }
            const acc = toolCallAccumulator.get(idx)!;
            if (tc.id) acc.id = tc.id;
            if (tc.function?.name) acc.name = tc.function.name;
            if (tc.function?.arguments) acc.args += tc.function.arguments;
          }
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  }

  // Flush any remaining tool calls
  for (const [, tc] of toolCallAccumulator) {
    yield {
      type: "tool_call",
      toolCall: {
        id: tc.id,
        type: "function",
        function: { name: tc.name, arguments: tc.args },
      },
    };
  }
  yield { type: "done" };
}

// ---------------------------------------------------------------------------
// Public API — Create streaming request
// ---------------------------------------------------------------------------

export { buildRequest, PROVIDER_ENDPOINTS };
export type { ProviderMessage, ChatRequestParams };
