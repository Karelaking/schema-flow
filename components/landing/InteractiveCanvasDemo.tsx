"use client";

import React, { useState } from "react";
import { 
  Database, 
  Copy, 
  Check, 
  Sparkles, 
  Key, 
  Link2, 
  Layers, 
  FileCode, 
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function InteractiveCanvasDemo(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"drizzle" | "postgres" | "mysql" | "query">("drizzle");
  const [copied, setCopied] = useState(false);
  const [autoTimestamps, setAutoTimestamps] = useState(true);
  const [selectedTable, setSelectedTable] = useState<"users" | "posts" | "comments">("users");

  // Dynamic Drizzle code snippet generation based on state
  const getDrizzleCode = () => {
    return `import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// 1. Users Table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),${autoTimestamps ? `
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),` : ""}
});

// 2. Posts Table (Ref: users.id)
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  published: integer("published").notNull().default(0),${autoTimestamps ? `
  createdAt: text("created_at").notNull(),` : ""}
});

// 3. Relational Mappings
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));`;
  };

  const getPostgresCode = () => {
    return `CREATE TABLE "users" (
  "id" VARCHAR(255) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "role" VARCHAR(64) DEFAULT 'user' NOT NULL${autoTimestamps ? `,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL` : ""}
);

CREATE TABLE "posts" (
  "id" VARCHAR(255) PRIMARY KEY,
  "user_id" VARCHAR(255) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT,
  "published" BOOLEAN DEFAULT false NOT NULL${autoTimestamps ? `,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL` : ""},
  CONSTRAINT "fk_posts_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);`;
  };

  const getMysqlCode = () => {
    return `CREATE TABLE \`users\` (
  \`id\` VARCHAR(255) PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`role\` VARCHAR(64) DEFAULT 'user' NOT NULL${autoTimestamps ? `,
  \`created_at\` DATETIME NOT NULL,
  \`updated_at\` DATETIME NOT NULL` : ""}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`posts\` (
  \`id\` VARCHAR(255) PRIMARY KEY,
  \`user_id\` VARCHAR(255) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`content\` TEXT NULL,
  \`published\` TINYINT(1) DEFAULT 0 NOT NULL${autoTimestamps ? `,
  \`created_at\` DATETIME NOT NULL` : ""},
  CONSTRAINT \`fk_posts_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  };

  const getQueryCode = () => {
    return `-- Type-Safe Select with Drizzle ORM Relational Query
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, "u-101"),
  with: {
    posts: {
      where: eq(posts.published, 1),
    },
  },
});

-- Insert Record using Drizzle ORM
await db.insert(users).values({
  id: "u-102",
  name: "Sarah Connor",
  email: "sarah@example.com",
  role: "admin",
});`;
  };

  const getCurrentCode = () => {
    switch (activeTab) {
      case "drizzle": return getDrizzleCode();
      case "postgres": return getPostgresCode();
      case "mysql": return getMysqlCode();
      case "query": return getQueryCode();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="showcase" className="py-16 md:py-24 bg-muted/30 border-y border-border/50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary mb-3">
            <Layers className="size-3.5" />
            <span>Interactive ERD & Code Engine</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            From Visual Nodes to Production Drizzle Code
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Try the live interactive builder below. Click tables, toggle settings, and watch your Drizzle ORM schema update in real-time.
          </p>
        </div>

        {/* Showcase Grid Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Interactive Visual Canvas Mockup */}
          <div className="lg:col-span-6 flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-xl shadow-black/5 relative overflow-hidden">
            
            {/* Control Bar */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-rose-500/80" />
                <div className="size-3 rounded-full bg-amber-500/80" />
                <div className="size-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs font-medium text-muted-foreground">Canvas: Ecommerce DB</span>
              </div>
              <button 
                onClick={() => setAutoTimestamps(!autoTimestamps)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  autoTimestamps ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {autoTimestamps ? "✓ Timestamps Enabled" : "+ Enable Timestamps"}
              </button>
            </div>

            {/* Simulated ERD Canvas Area */}
            <div className="relative flex-1 min-h-95 bg-slate-950/90 dark:bg-black/90 rounded-xl p-4 border border-white/10 overflow-hidden font-sans">
              
              {/* Background Grid Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] bg-size-[16px_16px] opacity-40 pointer-events-none" />

              {/* Connecting Relation SVG Line */}
              <svg className="absolute inset-0 size-full pointer-events-none z-10">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 185 130 C 230 130, 230 230, 275 230" 
                  fill="none" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="2.5" 
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
              </svg>

              <div className="relative z-20 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                
                {/* Table Node 1: users */}
                <div 
                  role="button"
                  tabIndex={0}
                  aria-label="Select demo table users"
                  onClick={() => setSelectedTable("users")}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedTable("users");
                    }
                  }}
                  className={`rounded-lg border bg-slate-900/90 p-3 shadow-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    selectedTable === "users" ? "border-primary ring-2 ring-primary/30 scale-[1.02]" : "border-slate-800 hover:border-slate-700 opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-400" />
                      <span className="font-mono text-xs font-bold text-slate-100">users</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">SQLite</Badge>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-amber-400">
                      <span className="flex items-center gap-1"><Key className="size-3" /> id</span>
                      <span className="text-slate-500">TEXT</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>name</span>
                      <span className="text-slate-500">TEXT</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>email</span>
                      <span className="text-slate-500">TEXT (UNIQUE)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>role</span>
                      <span className="text-slate-500">TEXT</span>
                    </div>
                    {autoTimestamps && (
                      <div className="flex items-center justify-between text-slate-500 border-t border-slate-800/80 pt-1">
                        <span>created_at</span>
                        <span>TEXT</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Table Node 2: posts */}
                <div 
                  role="button"
                  tabIndex={0}
                  aria-label="Select demo table posts"
                  onClick={() => setSelectedTable("posts")}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedTable("posts");
                    }
                  }}
                  className={`rounded-lg border bg-slate-900/90 p-3 shadow-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    selectedTable === "posts" ? "border-primary ring-2 ring-primary/30 scale-[1.02]" : "border-slate-800 hover:border-slate-700 opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-sky-400" />
                      <span className="font-mono text-xs font-bold text-slate-100">posts</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">1:N FK</Badge>
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-amber-400">
                      <span className="flex items-center gap-1"><Key className="size-3" /> id</span>
                      <span className="text-slate-500">TEXT</span>
                    </div>
                    <div className="flex items-center justify-between text-sky-400 font-bold">
                      <span className="flex items-center gap-1"><Link2 className="size-3" /> user_id</span>
                      <span className="text-slate-500">FK users.id</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>title</span>
                      <span className="text-slate-500">TEXT</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>published</span>
                      <span className="text-slate-500">INTEGER</span>
                    </div>
                    {autoTimestamps && (
                      <div className="flex items-center justify-between text-slate-500 border-t border-slate-800/80 pt-1">
                        <span>created_at</span>
                        <span>TEXT</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Canvas Toast Info */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs text-slate-300 backdrop-blur-md">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-amber-400" />
                  <span>Selected: <strong>{selectedTable}</strong> table</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Auto-Syncing AST</span>
              </div>
            </div>
          </div>

          {/* Right: Real-time Drizzle & SQL Code Generator */}
          <div className="lg:col-span-6 flex flex-col rounded-2xl border border-border/80 bg-slate-950 text-slate-100 shadow-xl overflow-hidden font-mono text-xs">
            
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-3">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("drizzle")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "drizzle" ? "bg-primary text-primary-foreground" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileCode className="size-3.5" />
                  <span>Drizzle ORM</span>
                </button>
                <button
                  onClick={() => setActiveTab("postgres")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "postgres" ? "bg-primary text-primary-foreground" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Database className="size-3.5" />
                  <span>PostgreSQL</span>
                </button>
                <button
                  onClick={() => setActiveTab("mysql")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "mysql" ? "bg-primary text-primary-foreground" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Database className="size-3.5" />
                  <span>MySQL</span>
                </button>
                <button
                  onClick={() => setActiveTab("query")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "query" ? "bg-primary text-primary-foreground" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="size-3.5" />
                  <span>Queries</span>
                </button>
              </div>

              {/* Copy Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="h-8 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                <span className="ml-1.5 font-sans text-xs">{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            {/* Code Block Container */}
            <div className="flex-1 p-4 overflow-y-auto max-h-105 bg-slate-950 text-slate-200 leading-relaxed font-mono">
              <pre className="whitespace-pre-wrap">{getCurrentCode()}</pre>
            </div>

            {/* Footer Bar */}
            <div className="border-t border-slate-800 bg-slate-900/40 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-400 font-sans">
              <span className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Generated via Schema AST Transformer</span>
              </span>
              <span>100% Type-Safe TypeScript</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
