"use client";

import React, { useState } from "react";
import { 
  Database, 
  Copy, 
  Check, 
  Sparkles, 
  Key, 
  Link2, 
  FileCode, 
  Zap,
  ShieldCheck,
  RefreshCw,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CodeTheme = "monochrome-dark" | "monochrome-light" | "tokyo-night" | "dracula";

/**
 * Live Schema Studio interactive workbench styled with Black & White code editor theme.
 */
export function InteractiveCanvasDemo(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"drizzle" | "postgres" | "mysql" | "query">("drizzle");
  const [codeTheme, setCodeTheme] = useState<CodeTheme>("monochrome-dark");
  const [copied, setCopied] = useState(false);
  const [autoTimestamps, setAutoTimestamps] = useState(true);
  const [selectedTable, setSelectedTable] = useState<"users" | "posts">("users");

  const getDrizzleCode = () => {
    return `import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// 1. Users Table Schema
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
  published: integer("published").notNull().default(0),${autoTimestamps ? `
  createdAt: text("created_at").notNull(),` : ""}
});

// 3. Relational Mappings
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
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
  "published" BOOLEAN DEFAULT false NOT NULL${autoTimestamps ? `,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL` : ""},
  CONSTRAINT "fk_posts_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);`;
  };

  const getMysqlCode = () => {
    return `CREATE TABLE \`users\` (
  \`id\` VARCHAR(255) PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL UNIQUE${autoTimestamps ? `,
  \`created_at\` DATETIME NOT NULL` : ""}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  };

  const getQueryCode = () => {
    return `-- Drizzle ORM Relational Query
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, "u-101"),
  with: { posts: true },
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

  // Black and white theme style mappings
  const getThemeStyles = () => {
    switch (codeTheme) {
      case "monochrome-dark":
        return {
          containerBg: "bg-black text-white border-zinc-800 shadow-2xl",
          headerBg: "bg-zinc-950 border-zinc-800",
          activeTabBtn: "bg-white text-black font-extrabold shadow-sm",
          inactiveTabBtn: "text-zinc-400 hover:text-white font-medium",
          footerBg: "bg-zinc-950 border-zinc-800 text-zinc-400",
          dotColor: "bg-white",
        };
      case "monochrome-light":
        return {
          containerBg: "bg-white text-black border-slate-300 shadow-xl",
          headerBg: "bg-slate-100 border-slate-200",
          activeTabBtn: "bg-black text-white font-extrabold shadow-sm",
          inactiveTabBtn: "text-slate-600 hover:text-black font-medium",
          footerBg: "bg-slate-100 border-slate-200 text-slate-600",
          dotColor: "bg-black",
        };
      case "tokyo-night":
        return {
          containerBg: "bg-[#1a1b26] text-[#a9b1d6] border-[#24283b]",
          headerBg: "bg-[#16161e] border-[#24283b]",
          activeTabBtn: "bg-[#7dcfff] text-[#1a1b26] font-extrabold shadow-sm",
          inactiveTabBtn: "text-[#565f89] hover:text-[#a9b1d6]",
          footerBg: "bg-[#16161e] border-[#24283b] text-[#565f89]",
          dotColor: "bg-[#7dcfff]",
        };
      case "dracula":
        return {
          containerBg: "bg-[#282a36] text-[#f8f8f2] border-[#44475a]",
          headerBg: "bg-[#21222c] border-[#44475a]",
          activeTabBtn: "bg-[#ff79c6] text-[#282a36] font-extrabold shadow-sm",
          inactiveTabBtn: "text-[#6272a4] hover:text-[#f8f8f2]",
          footerBg: "bg-[#21222c] border-[#44475a] text-[#6272a4]",
          dotColor: "bg-[#ff79c6]",
        };
    }
  };

  const currentTheme = getThemeStyles();

  return (
    <section id="showcase" className="relative w-full border-b border-border/40 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl border-x border-border/40 py-16 md:py-24">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Design in visual flow. Output in instant code.
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            Drag tables, link relationships, and watch your Drizzle ORM models compile instantly in side-by-side sync.
          </p>
        </div>

        {/* 2-Column Framed Grid Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/40 border-t border-border/40">
          
          {/* Left Canvas Panel */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            
            {/* Control Bar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-rose-500/80" />
                <div className="size-3 rounded-full bg-amber-500/80" />
                <div className="size-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs font-semibold text-foreground">Canvas: Ecommerce DB</span>
              </div>
              <button 
                onClick={() => setAutoTimestamps(!autoTimestamps)}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  autoTimestamps ? "bg-foreground text-background font-bold shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {autoTimestamps ? "✓ Timestamps Enabled" : "+ Enable Timestamps"}
              </button>
            </div>

            {/* Simulated ERD Canvas Area */}
            <div className="relative flex-1 min-h-95 bg-black rounded-2xl p-4 border border-zinc-800 overflow-hidden font-sans shadow-2xl">
              
              {/* Background Grid Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-size-[16px_16px] opacity-60 pointer-events-none" />

              {/* Connecting Line SVG */}
              <svg className="absolute inset-0 size-full pointer-events-none z-10">
                <path 
                  d="M 185 130 C 230 130, 230 230, 275 230" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                  strokeDasharray="4 2"
                  className="animate-pulse opacity-75"
                />
              </svg>

              <div className="relative z-20 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                
                {/* Table Node 1 */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTable("users")}
                  onKeyDown={e => { if (e.key === "Enter") setSelectedTable("users"); }}
                  className={`rounded-xl border bg-zinc-950 p-3.5 shadow-xl transition-all cursor-pointer ${
                    selectedTable === "users" ? "border-white ring-2 ring-white/20 scale-[1.02]" : "border-zinc-800 opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-white" />
                      <span className="font-mono text-xs font-bold text-white">users</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400">SQLite</Badge>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span className="flex items-center gap-1"><Key className="size-3 text-zinc-400" /> id</span>
                      <span className="text-zinc-500">TEXT</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>name</span>
                      <span className="text-zinc-500">TEXT</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>email</span>
                      <span className="text-zinc-500">UNIQUE</span>
                    </div>
                    {autoTimestamps && (
                      <div className="flex items-center justify-between text-zinc-500 border-t border-zinc-800/80 pt-1">
                        <span>created_at</span>
                        <span>TEXT</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Table Node 2 */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTable("posts")}
                  onKeyDown={e => { if (e.key === "Enter") setSelectedTable("posts"); }}
                  className={`rounded-xl border bg-zinc-950 p-3.5 shadow-xl transition-all cursor-pointer ${
                    selectedTable === "posts" ? "border-white ring-2 ring-white/20 scale-[1.02]" : "border-zinc-800 opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-zinc-400" />
                      <span className="font-mono text-xs font-bold text-white">posts</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400">1:N FK</Badge>
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span className="flex items-center gap-1"><Key className="size-3 text-zinc-400" /> id</span>
                      <span className="text-zinc-500">TEXT</span>
                    </div>
                    <div className="flex items-center justify-between text-white font-bold">
                      <span className="flex items-center gap-1"><Link2 className="size-3 text-zinc-400" /> user_id</span>
                      <span className="text-zinc-500">FK users.id</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>title</span>
                      <span className="text-zinc-500">TEXT</span>
                    </div>
                    {autoTimestamps && (
                      <div className="flex items-center justify-between text-zinc-500 border-t border-zinc-800/80 pt-1">
                        <span>created_at</span>
                        <span>TEXT</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Canvas Toast */}
              <div className="absolute bottom-3 left-3 right-3 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between text-xs text-white backdrop-blur-md">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-zinc-400" />
                  <span>Selected: <strong>{selectedTable}</strong> table</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Monochrome AST</span>
              </div>
            </div>
          </div>

          {/* Right Code Generator Panel — High Contrast Black & White Theme */}
          <div className={`lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between transition-colors duration-300 font-mono text-xs ${currentTheme.containerBg}`}>
            
            {/* Header Controls (Tabs + Theme Switcher + Copy) */}
            <div className={`flex flex-wrap items-center justify-between border-b pb-3.5 gap-2 ${currentTheme.headerBg}`}>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("drizzle")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-sans text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "drizzle" ? currentTheme.activeTabBtn : currentTheme.inactiveTabBtn
                  }`}
                >
                  <FileCode className="size-3.5" />
                  <span>Drizzle ORM</span>
                </button>
                <button
                  onClick={() => setActiveTab("postgres")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-sans text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "postgres" ? currentTheme.activeTabBtn : currentTheme.inactiveTabBtn
                  }`}
                >
                  <Database className="size-3.5" />
                  <span>PostgreSQL</span>
                </button>
                <button
                  onClick={() => setActiveTab("mysql")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-sans text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "mysql" ? currentTheme.activeTabBtn : currentTheme.inactiveTabBtn
                  }`}
                >
                  <Database className="size-3.5" />
                  <span>MySQL</span>
                </button>
              </div>

              {/* Theme Switcher Dots */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-zinc-800 p-1 bg-black/40">
                  <button
                    onClick={() => setCodeTheme("monochrome-dark")}
                    title="Monochrome Dark (Black & White)"
                    className={`size-4.5 rounded-full bg-black border border-white transition-transform ${codeTheme === "monochrome-dark" ? "scale-125 ring-2 ring-white" : "opacity-70"}`}
                  />
                  <button
                    onClick={() => setCodeTheme("monochrome-light")}
                    title="Monochrome Light (White & Black)"
                    className={`size-4.5 rounded-full bg-white border border-black transition-transform ${codeTheme === "monochrome-light" ? "scale-125 ring-2 ring-black" : "opacity-70"}`}
                  />
                  <button
                    onClick={() => setCodeTheme("tokyo-night")}
                    title="Tokyo Night Theme"
                    className={`size-4.5 rounded-full bg-[#1a1b26] border border-sky-400 transition-transform ${codeTheme === "tokyo-night" ? "scale-125 ring-2 ring-sky-400" : "opacity-70"}`}
                  />
                  <button
                    onClick={() => setCodeTheme("dracula")}
                    title="Dracula Theme"
                    className={`size-4.5 rounded-full bg-[#282a36] border border-pink-500 transition-transform ${codeTheme === "dracula" ? "scale-125 ring-2 ring-pink-500" : "opacity-70"}`}
                  />
                </div>

                {/* Copy Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-8 cursor-pointer rounded-full font-sans text-xs border border-zinc-800 hover:bg-zinc-800"
                >
                  {copied ? <Check className="size-3.5 text-white" /> : <Copy className="size-3.5 text-white" />}
                  <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            {/* Code Block Container */}
            <div className="flex-1 py-4 overflow-y-auto max-h-105 leading-relaxed font-mono">
              <pre className="whitespace-pre-wrap font-mono tracking-tight text-xs">{getCurrentCode()}</pre>
            </div>

            {/* Footer Bar */}
            <div className={`border-t pt-3 flex items-center justify-between text-[11px] font-sans ${currentTheme.footerBg}`}>
              <span className="flex items-center gap-1.5">
                <div className={`size-2 rounded-full ${currentTheme.dotColor}`} />
                <span className="capitalize font-extrabold">{codeTheme.replace("-", " ")}</span>
              </span>
              <span>100% Type-Safe TypeScript</span>
            </div>

          </div>

        </div>

        {/* Bottom Feature Matrix Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border/40">
          
          <div className="p-6 sm:p-8 space-y-2 border-b md:border-b-0 border-r border-border/40">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <Zap className="size-4 text-primary" />
              <span>Zero-Latency AST Engine</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Schema changes compile to code in under 10ms without page reloads or web worker lag.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-2 border-b md:border-b-0 border-r border-border/40">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              <span>Type-Safe Autocomplete</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Production-ready Drizzle ORM TypeScript models out of the box for immediate database queries.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <RefreshCw className="size-4 text-primary" />
              <span>Universal Multi-Dialect</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instant 1-click conversion between SQLite, PostgreSQL & MySQL DDLs.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
