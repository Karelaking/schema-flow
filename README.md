<p align="center">
  <img alt="header" src="https://shieldcn.dev/header/dots.svg?title=Schema+Flow&amp;subtitle=Schema+Flow+is+an+open-source%2C+interactive%2C+visual+database+schema+design+tool.Design+database+architectures+visually.&amp;logo=xyflow&amp;logoColor=f97316&amp;mode=dark" />
</p>


# Overview

**Schema Flow** is an open-source, interactive, visual database schema design tool. Design database architectures visually, create multiple schema projects, manage relationships, and export production-ready SQL and TypeScript DDL code.

---

## 🌟 Key Features

- **Visual Schema Canvas**: Drag, drop, and interconnect database tables with custom handles and dynamic relationship lines using `@xyflow/react`.
- **Modern Design System**: Powered by [shadcn/ui](file:///e:/schema-flow/components.json) with `@base-ui/react` primitives and Tailwind CSS v4 (`base-nova` design preset).
- **Multi-Project Management**: Create, switch, and manage multiple database design projects seamlessly.
- **Smart Column Defaults**: Automatic `id` (Primary Key) and `created_at` / `updated_at` (Timestamp) column generation with instant UI toggles.
- **SQL & TypeScript Generator**: Generate clean SQL DDL (SQLite, PostgreSQL, MySQL) and TypeScript type declarations on the fly.
- **Interactive Inspector & Modals**: Comprehensive project settings, query builders, and export dialogues built using accessible shadcn overlay primitives.
- **Mobile Responsive**: Adaptive mobile drawer layout and bottom tab navigation for working on phones and tablets.
- **Flexible Self-Hosting**: Run locally, on a server, or via Docker with zero vendor lock-in.

---

## 🛠️ Tech Stack & UI Architecture

### Core Technologies
- **Framework**: Next.js 16 (App Router with React 19)
- **UI Components**: [shadcn/ui](file:///e:/schema-flow/components.json) (`base-nova` style with `@base-ui/react` primitives)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) with CSS variables and dark mode support
- **State Management**: Zustand
- **Canvas Engine**: React Flow (`@xyflow/react`)
- **Database & DDL**: Drizzle ORM, `@libsql/client`, `better-sqlite3`, `sql-formatter`
- **Iconography**: Lucide Icons (`lucide-react`)
- **Notifications**: Sonner (`sonner`)

### Component Architecture
All reusable UI components are housed in [`components/ui/`](file:///e:/schema-flow/components/ui) following shadcn composition guidelines:
- **Design System Tokens**: Built on semantic CSS variables (`bg-background`, `text-muted-foreground`, `bg-primary`) to support light and dark themes seamlessly.
- **Layout & Spacing**: Enforces standard flex layout patterns with `gap-*` spacing and `size-*` square dimensions.

#### Installed UI Primitives
| Component | Description | Source File |
| --- | --- | --- |
| `Badge` | Status and label badges | [`components/ui/badge.tsx`](file:///e:/schema-flow/components/ui/badge.tsx) |
| `Button` | Interactive button actions | [`components/ui/button.tsx`](file:///e:/schema-flow/components/ui/button.tsx) |
| `Card` | Structured content containers | [`components/ui/card.tsx`](file:///e:/schema-flow/components/ui/card.tsx) |
| `Command` | Fast command palette & search | [`components/ui/command.tsx`](file:///e:/schema-flow/components/ui/command.tsx) |
| `Dialog` | Modal dialog overlays | [`components/ui/dialog.tsx`](file:///e:/schema-flow/components/ui/dialog.tsx) |
| `DropdownMenu` | Context and action menus | [`components/ui/dropdown-menu.tsx`](file:///e:/schema-flow/components/ui/dropdown-menu.tsx) |
| `Input` | Text input controls | [`components/ui/input.tsx`](file:///e:/schema-flow/components/ui/input.tsx) |
| `Kbd` | Keyboard shortcut badges | [`components/ui/kbd.tsx`](file:///e:/schema-flow/components/ui/kbd.tsx) |
| `Label` | Accessible form labels | [`components/ui/label.tsx`](file:///e:/schema-flow/components/ui/label.tsx) |
| `Select` | Dropdown select menus | [`components/ui/select.tsx`](file:///e:/schema-flow/components/ui/select.tsx) |
| `Separator` | Visual divider lines | [`components/ui/separator.tsx`](file:///e:/schema-flow/components/ui/separator.tsx) |
| `Sheet` | Side drawer overlay panels | [`components/ui/sheet.tsx`](file:///e:/schema-flow/components/ui/sheet.tsx) |
| `Skeleton` | Loading state placeholders | [`components/ui/skeleton.tsx`](file:///e:/schema-flow/components/ui/skeleton.tsx) |
| `Sonner` | Toast notification manager | [`components/ui/sonner.tsx`](file:///e:/schema-flow/components/ui/sonner.tsx) |
| `Switch` | Toggle switches | [`components/ui/switch.tsx`](file:///e:/schema-flow/components/ui/switch.tsx) |
| `Tabs` | Tabbed navigation interfaces | [`components/ui/tabs.tsx`](file:///e:/schema-flow/components/ui/tabs.tsx) |
| `Textarea` | Multi-line text input | [`components/ui/textarea.tsx`](file:///e:/schema-flow/components/ui/textarea.tsx) |
| `ThemeToggle` | Light/Dark theme switcher | [`components/ui/theme-toggle.tsx`](file:///e:/schema-flow/components/ui/theme-toggle.tsx) |
| `Tooltip` | Hover information popups | [`components/ui/tooltip.tsx`](file:///e:/schema-flow/components/ui/tooltip.tsx) |

---

## 🎨 Working with shadcn/ui

This project uses the `shadcn` CLI for managing components. Refer to [`components.json`](file:///e:/schema-flow/components.json) for the active configuration.

### Common CLI Operations

```bash
# View project configuration & installed components
npx shadcn@latest info

# Search available components in registry
npx shadcn@latest search

# Add new components to components/ui/
npx shadcn@latest add <component-name>

# View documentation & example links for components
npx shadcn@latest docs button dialog select
```

---

## 🛠️ Environment Configuration

Environment variables can be set in a `.env` or `.env.local` file at the root of the project:

```bash
# SQLite Database File Path (Default: ./data/schema-flow.db)
DATABASE_PATH=./data/schema-flow.db

# Server Binding
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

Copy `.env.example` to start:
```bash
cp .env.example .env
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ or 20+
- pnpm (recommended) or npm / yarn

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/your-username/schema-flow.git
cd schema-flow

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

Run the containerized application with a persistent database volume in one command:

```bash
docker compose up -d
```

Access the app at `http://localhost:3000`. Database files will be persisted in `./data/`.

### Using Docker CLI

```bash
# Build the image
docker build -t schema-flow .

# Run the container with volume mount
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --name schema-flow \
  schema-flow
```

---

## 🧪 Running Tests & Building

```bash
# Run unit tests
pnpm test

# Production build
pnpm build
```

---

## 📄 License

MIT License. Open source and free for personal and commercial self-hosting.
