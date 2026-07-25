// =============================================================================
// RAG Knowledge Base — Database Blueprints & Anti-Patterns
// =============================================================================
//
// Curated library of enterprise database architecture blueprints,
// dialect optimizations, indexing strategies, and anti-patterns.
// =============================================================================

import type { KnowledgeDocument } from "./rag-types";

export const KNOWLEDGE_BASE: KnowledgeDocument[] = [
  // ---------------------------------------------------------------------------
  // 1. Multi-Tenant SaaS Architecture
  // ---------------------------------------------------------------------------
  {
    id: "pattern-multi-tenant-saas",
    title: "Multi-Tenant SaaS Database Blueprint (Org/Tenant Scoping & RBAC)",
    category: "pattern",
    tags: ["saas", "multi-tenant", "tenant_id", "organizations", "users", "rbac", "roles", "permissions"],
    summary: "Standard multi-tenant SaaS schema pattern with organization scoping, user memberships, role-based access control (RBAC), and tenant isolation.",
    content: `
Multi-Tenant SaaS Design Principles:
1. Tenant Isolation: Every tenant-owned table MUST include an 'organization_id' (or 'tenant_id') foreign key referencing 'organizations.id'.
2. RBAC Architecture: Use a junction table 'organization_memberships' linking 'users' to 'organizations' with a 'role' column (e.g. 'owner', 'admin', 'member').
3. Multi-Tenant Indexes: Always create composite indexes starting with 'organization_id' on tenant-scoped tables (e.g., INDEX idx_orders_org_user (organization_id, user_id)).
4. Primary Keys: Use UUID or BIGINT for primary keys across multi-tenant tables.
    `,
    exampleSchema: {
      tables: [
        {
          name: "organizations",
          description: "Tenant organizations or workspaces",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
            { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL" },
            { name: "slug", type: "VARCHAR(100)", constraints: "UNIQUE NOT NULL" },
            { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP" },
          ],
        },
        {
          name: "users",
          description: "Global user accounts across organizations",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
            { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL" },
            { name: "password_hash", type: "VARCHAR(255)", constraints: "NOT NULL" },
            { name: "full_name", type: "VARCHAR(255)" },
            { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP" },
          ],
        },
        {
          name: "organization_memberships",
          description: "Junction table assigning users to organizations with roles",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
            { name: "organization_id", type: "UUID", constraints: "REFERENCES organizations(id)" },
            { name: "user_id", type: "UUID", constraints: "REFERENCES users(id)" },
            { name: "role", type: "VARCHAR(50)", constraints: "NOT NULL" },
            { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP" },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 2. E-Commerce & Inventory Management
  // ---------------------------------------------------------------------------
  {
    id: "pattern-ecommerce-inventory",
    title: "E-Commerce & Order Management Blueprint (Catalog, Cart, Orders & Items)",
    category: "pattern",
    tags: ["ecommerce", "products", "orders", "order_items", "inventory", "cart", "skus", "variants"],
    summary: "Robust e-commerce schema separating products, product variants/SKUs, orders, snapshot order items, and inventory tracking.",
    content: `
E-Commerce Design Principles:
1. Historical Snapshots: 'order_items' MUST store a snapshot of unit_price and product_name at the time of purchase, rather than relying solely on joins to 'products'.
2. Variant Normalization: Separate base 'products' (title, description) from sellable 'product_variants' (SKU, price, stock_quantity, attributes).
3. Order Status State Machine: Use explicit status columns ('pending', 'paid', 'shipped', 'cancelled') and log state changes in an 'order_status_history' table.
4. Decimal Precision: Always store prices using DECIMAL(12, 2) or INTEGER cents to avoid floating-point rounding errors.
    `,
    exampleSchema: {
      tables: [
        {
          name: "products",
          description: "Base product catalog entries",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
            { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL" },
            { name: "slug", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL" },
            { name: "is_active", type: "BOOLEAN", constraints: "DEFAULT true" },
          ],
        },
        {
          name: "product_variants",
          description: "Specific sellable SKUs with price and stock",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
            { name: "product_id", type: "UUID", constraints: "REFERENCES products(id)" },
            { name: "sku", type: "VARCHAR(100)", constraints: "UNIQUE NOT NULL" },
            { name: "price", type: "DECIMAL(12, 2)", constraints: "NOT NULL" },
            { name: "stock_quantity", type: "INTEGER", constraints: "DEFAULT 0" },
          ],
        },
        {
          name: "orders",
          description: "Customer placed orders",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
            { name: "user_id", type: "UUID", constraints: "REFERENCES users(id)" },
            { name: "total_amount", type: "DECIMAL(12, 2)", constraints: "NOT NULL" },
            { name: "status", type: "VARCHAR(50)", constraints: "DEFAULT 'pending'" },
            { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP" },
          ],
        },
        {
          name: "order_items",
          description: "Snapshot line items inside an order",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
            { name: "order_id", type: "UUID", constraints: "REFERENCES orders(id)" },
            { name: "variant_id", type: "UUID", constraints: "REFERENCES product_variants(id)" },
            { name: "unit_price", type: "DECIMAL(12, 2)", constraints: "NOT NULL" },
            { name: "quantity", type: "INTEGER", constraints: "NOT NULL" },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 3. Financial Ledger & Double-Entry Accounting
  // ---------------------------------------------------------------------------
  {
    id: "pattern-financial-ledger",
    title: "Double-Entry Financial Ledger Blueprint",
    category: "pattern",
    tags: ["financial", "ledger", "accounting", "double-entry", "transactions", "entries", "balances"],
    summary: "Immutable double-entry ledger design ensuring sum of debits equals sum of credits per transaction.",
    content: `
Financial Ledger Principles:
1. Immutable Transactions: Never UPDATE or DELETE posted transaction entries. Use reversing adjustment entries to correct mistakes.
2. Double-Entry Invariant: Every transaction MUST have two or more entries where total debits equal total credits.
3. Strict Foreign Keys: Link all entries to accounts and transactions with strict ON DELETE RESTRICT constraints.
    `,
  },

  // ---------------------------------------------------------------------------
  // 4. Dialect Optimizations (Postgres, SQLite, MySQL)
  // ---------------------------------------------------------------------------
  {
    id: "dialect-postgres",
    title: "PostgreSQL Database Dialect Best Practices",
    category: "dialect",
    dialects: ["postgres"],
    tags: ["postgres", "postgresql", "uuid", "jsonb", "timestamptz", "serial"],
    summary: "PostgreSQL specific optimizations: TIMESTAMPTZ, UUID v4, JSONB, GIN indexes, and BIGSERIAL.",
    content: `
PostgreSQL Best Practices:
1. Timestamps: Use 'TIMESTAMPTZ' (timestamp with time zone) instead of plain 'TIMESTAMP'.
2. Primary Keys: Use 'UUID' (with gen_random_uuid()) or 'BIGSERIAL' / 'BIGINT GENERATED ALWAYS AS IDENTITY'.
3. Unstructured Data: Use 'JSONB' for semi-structured documents, and pair with GIN indexes (CREATE INDEX ON t USING gin (data)).
4. Foreign Key Indexes: PostgreSQL does NOT automatically create indexes on foreign key columns. You MUST explicitly create an index on every foreign key column.
    `,
  },
  {
    id: "dialect-sqlite",
    title: "SQLite Dialect Best Practices",
    category: "dialect",
    dialects: ["sqlite"],
    tags: ["sqlite", "integer_primary_key", "autoincrement", "text_datetime"],
    summary: "SQLite specific rules: INTEGER PRIMARY KEY for rowid alias, TEXT/INTEGER for dates, and PRAGMA foreign_keys.",
    content: `
SQLite Best Practices:
1. Primary Keys: Use 'INTEGER PRIMARY KEY' to make the column an alias for rowid (fastest lookup). Avoid 'AUTOINCREMENT' unless strict non-reusable IDs are needed.
2. Datetimes: SQLite does not have a native DATETIME type. Use 'TEXT' (ISO-8601 strings) or 'INTEGER' (Unix epoch timestamps).
3. Foreign Keys: Foreign keys are disabled by default in SQLite. Ensure your application executes 'PRAGMA foreign_keys = ON;'.
    `,
  },

  // ---------------------------------------------------------------------------
  // 5. Anti-Patterns & Common Pitfalls
  // ---------------------------------------------------------------------------
  {
    id: "antipattern-unindexed-fk",
    title: "Anti-Pattern: Unindexed Foreign Keys",
    category: "antipattern",
    tags: ["foreign_keys", "indexes", "performance", "join_performance"],
    summary: "Unindexed foreign key columns cause slow JOIN queries and full table scans during cascading deletes.",
    content: `
Why Unindexed Foreign Keys Are Dangerous:
1. Slow Joins: When joining parent and child tables (e.g. JOIN orders ON orders.user_id = users.id), the database engine must perform full table scans if 'user_id' lacks an index.
2. Cascading Delete Locks: On DELETE or UPDATE operations on the parent table, the DB checks child tables for foreign key matches. Without an index, this acquires full table locks.
Fix: Create an index on EVERY foreign key column (e.g. CREATE INDEX idx_orders_user_id ON orders(user_id)).
    `,
  },
  {
    id: "antipattern-single-tenant-trap",
    title: "Anti-Pattern: Missing Tenant Scoping (Single-Tenant Trap)",
    category: "antipattern",
    tags: ["saas", "tenant_id", "security", "data_leakage"],
    summary: "Failing to include tenant_id on secondary tables risks cross-tenant data leaks in multi-tenant apps.",
    content: `
Why Omitting tenant_id on Child Tables Causes Security Leaks:
If 'orders' has 'organization_id' but 'order_items' only has 'order_id', a bug in an API endpoint querying 'order_items' directly without joining 'orders' can leak items across organizations.
Fix: Denormalize 'organization_id' into all transactional child tables or enforce strict RLS (Row Level Security).
    `,
  },
];
