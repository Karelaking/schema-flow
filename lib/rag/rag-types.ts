// =============================================================================
// RAG Knowledge Engine — Type Definitions
// =============================================================================

import type { DatabaseDialect } from "@/packages/schema-core";

/** Category of knowledge documents */
export type KnowledgeCategory =
  | "pattern"      // Enterprise database design blueprints (SaaS, E-Commerce, etc.)
  | "dialect"      // Database-specific constraints and optimizations (SQLite, Postgres, MySQL)
  | "normalization"// 1NF, 2NF, 3NF rules & indexing strategies
  | "antipattern";  // Common pitfalls (single-tenant trap, missing FK index, etc.)

/** A structured document in the knowledge base */
export interface KnowledgeDocument {
  id: string;
  title: string;
  category: KnowledgeCategory;
  dialects?: DatabaseDialect[];
  tags: string[];
  summary: string;
  content: string;
  exampleSchema?: {
    tables: Array<{
      name: string;
      description: string;
      columns: Array<{ name: string; type: string; constraints?: string }>;
    }>;
  };
}

/** Search query parameters for RAG engine */
export interface RAGSearchQuery {
  query: string;
  dialect?: DatabaseDialect;
  category?: KnowledgeCategory;
  topK?: number;
}

/** Search result item returned by RAG engine */
export interface RAGSearchResult {
  document: KnowledgeDocument;
  score: number; // Relevance score (0.0 to 1.0)
  matchReason: string;
}
