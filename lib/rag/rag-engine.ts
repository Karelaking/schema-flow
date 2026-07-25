// =============================================================================
// RAG Knowledge Engine — Retrieval Processor
// =============================================================================
//
// Performs hybrid keyword, tag matching, and TF-IDF relevance scoring to
// retrieve domain blueprints, dialect tips, and anti-pattern warnings.
// =============================================================================

import { KNOWLEDGE_BASE } from "./knowledge-base";
import type { RAGSearchQuery, RAGSearchResult } from "./rag-types";

/**
 * Searches the RAG knowledge base for documents relevant to the user query.
 */
export function queryKnowledgeBase(params: RAGSearchQuery): RAGSearchResult[] {
  const { query, dialect, category, topK = 3 } = params;
  if (!query || query.trim().length === 0) return [];

  const tokens = tokenize(query);

  const scoredResults: RAGSearchResult[] = KNOWLEDGE_BASE.map((doc) => {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Dialect Filter / Bonus
    if (dialect && doc.dialects) {
      if (doc.dialects.includes(dialect)) {
        score += 0.3;
        matchReasons.push(`Matches target dialect (${dialect})`);
      } else {
        // Penalty for mismatching dialect
        score -= 0.5;
      }
    }

    // 2. Category Filter / Bonus
    if (category && doc.category === category) {
      score += 0.2;
      matchReasons.push(`Matches category (${category})`);
    }

    // 3. Tag Exact Matches
    for (const tag of doc.tags) {
      const tagLower = tag.toLowerCase();
      if (tokens.some((t) => tagLower.includes(t) || t.includes(tagLower))) {
        score += 0.4;
        matchReasons.push(`Matched tag '${tag}'`);
      }
    }

    // 4. Content TF-IDF / Term Frequency
    const docText = `${doc.title} ${doc.summary} ${doc.content}`.toLowerCase();
    let termMatches = 0;
    for (const token of tokens) {
      if (docText.includes(token)) {
        termMatches++;
      }
    }

    if (tokens.length > 0) {
      const termRatio = termMatches / tokens.length;
      score += termRatio * 0.5;
      if (termMatches > 0) {
        matchReasons.push(`Matched ${termMatches}/${tokens.length} search keywords`);
      }
    }

    return {
      document: doc,
      score: Math.max(0, score),
      matchReason: matchReasons.join(", ") || "General relevance",
    };
  });

  // Filter out zero scores and sort descending
  return scoredResults
    .filter((r) => r.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Formats RAG search results into a clean system prompt context section.
 */
export function buildRAGPromptContext(results: RAGSearchResult[]): string {
  if (results.length === 0) return "";

  const lines: string[] = [
    "\n## RAG Architectural Knowledge Base (Domain Blueprints & Rules)",
    "Use the following curated database architecture patterns and anti-pattern warnings to guide your schema design decisions:\n",
  ];

  results.forEach((r, idx) => {
    const doc = r.document;
    lines.push(`### [Pattern ${idx + 1}] ${doc.title} (${doc.category.toUpperCase()})`);
    lines.push(`*Relevance: ${(r.score * 100).toFixed(0)}% (${r.matchReason})*`);
    lines.push(doc.summary);
    lines.push("```text");
    lines.push(doc.content.trim());
    lines.push("```\n");
  });

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}
