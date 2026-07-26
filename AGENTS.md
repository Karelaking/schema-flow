<!-- BEGIN:nextjs-agent-rules -->
 
# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

# Rules for working with shadcn/ui + drizzle

## Code Location

- Components must be in `components/ui`
- Drizzle adapters must be in `lib/drizzle`

## Naming Conventions

- Components: `components/ui/*.tsx` (camelCase)
- Adaptors: `lib/drizzle/*.ts` (PascalCase for adapters, snake_case for queries)

## Common Mistakes to Avoid

1. **Do NOT put components in `app/`** — they belong in `components/ui`
2. **Do NOT write plain JS** — always use TypeScript
3. **Do NOT skip drizzle adapters** — use them for all database operations
4. **Do NOT rename things without checking** — follow the naming conventions above

<!-- END:nextjs-agent-rules -->