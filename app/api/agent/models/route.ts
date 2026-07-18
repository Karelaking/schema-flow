// =============================================================================
// API Route: Fetch Available Models from OpenRouter
// =============================================================================
//
// GET /api/agent/models
// Fetches the live model list from OpenRouter, categorized into free & premium.
// =============================================================================

import { NextRequest } from "next/server";

export const runtime = "nodejs";

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  top_provider?: {
    max_completion_tokens?: number;
  };
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
  };
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const apiKey = request.headers.get("x-api-key") ?? "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Failed to fetch models: ${response.status} ${errorText.slice(0, 200)}` },
        { status: response.status }
      );
    }

    const data = (await response.json()) as OpenRouterModelsResponse;

    // Filter to text-generating models and transform into our format
    const models = data.data
      .filter((m) => {
        // Only include text-output models
        const outputModes = m.architecture?.output_modalities ?? [];
        return outputModes.includes("text") || outputModes.length === 0;
      })
      .map((m) => {
        const promptCost = parseFloat(m.pricing?.prompt ?? "0");
        const completionCost = parseFloat(m.pricing?.completion ?? "0");
        const isFree = promptCost === 0 && completionCost === 0;

        return {
          id: m.id,
          name: m.name || m.id,
          isFree,
          contextLength: m.context_length,
          promptCost,
          completionCost,
        };
      })
      .sort((a, b) => {
        // Free models first, then alphabetically
        if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return Response.json({ models });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch models";
    return Response.json({ error: message }, { status: 500 });
  }
}
