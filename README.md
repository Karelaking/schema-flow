# Schema Flow 🚀

**Schema Flow** is an open-source, interactive, visual database schema design tool built with Next.js, React Flow, and SQLite. Design database architectures visually, create multiple schema projects, manage relationships, and export production-ready SQL and TypeScript DDL code.

---

## 🌟 Key Features

- **Visual Schema Canvas**: Drag, drop, and interconnect database tables with custom handles and dynamic relationship lines.
- **Multi-Project Management**: Create, switch, and manage multiple database design projects seamlessly.
- **Smart Column Defaults**: Automatic `id` (Primary Key) and `created_at` / `updated_at` (Timestamp) column generation with instant UI toggles.
- **SQL & TypeScript Generator**: Generate clean SQL DDL (SQLite, PostgreSQL, MySQL) and TypeScript type declarations on the fly.
- **Mobile Responsive**: Adaptive mobile drawer layout and bottom tab navigation for working on phones and tablets.
- **Flexible Self-Hosting**: Run locally, on a server, or via Docker with zero vendor lock-in.

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
