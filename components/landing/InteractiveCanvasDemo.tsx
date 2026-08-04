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
  Code2,
} from "lucide-react";
import { Button } from "@schema-flow/components/ui/button";
import { Badge } from "@schema-flow/components/ui/badge";
import { cn } from "@/lib/utils";

type DialectTab = "postgres" | "mysql" | "query";

/**
 * Renders syntax-highlighted code segments for Drizzle, PostgreSQL, MySQL, and Queries.
 */
function renderSyntaxHighlightedCode(code: string): React.ReactNode {
  const lines = code.split("\n");

  return lines.map((line, lineIdx) => {
    // Comment lines
    if (line.trim().startsWith("//") || line.trim().startsWith("--")) {
      return (
        <div key={lineIdx} className="text-muted-foreground/60 italic font-mono">
          {line}
        </div>
      );
    }

    // Tokenizer regex for strings, keywords, numbers, types
    const tokenRegex = /(".*?"|`.*?`|'.*?'|\b(?:import|export|const|from|CREATE|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|NOT|NULL|CASCADE|VARCHAR|UUID|TIMESTAMP|BOOLEAN|NUMERIC|DECIMAL|CHAR|DATETIME|ENGINE|InnoDB|CHARSET|utf8mb4|WITH|TIME|ZONE|ON|DELETE)\b|\b(?:pgTable|sqliteTable|text|integer|uuid|varchar|numeric|timestamp|relations|eq|findFirst)\b|\b\d+\b)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      const token = match[0];
      if (token.startsWith('"') || token.startsWith("`") || token.startsWith("'")) {
        // Strings in emerald
        parts.push(
          <span key={match.index} className="text-emerald-400 font-medium">
            {token}
          </span>
        );
      } else if (
        /^(import|export|const|from|CREATE|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|NOT|NULL|CASCADE|ON|DELETE)$/i.test(
          token
        )
      ) {
        // Control keywords in indigo/purple
        parts.push(
          <span key={match.index} className="text-indigo-400 font-bold">
            {token}
          </span>
        );
      } else if (
        /^(pgTable|sqliteTable|text|integer|uuid|varchar|numeric|timestamp|relations|eq|findFirst)$/.test(
          token
        )
      ) {
        // Functions / Types in sky blue
        parts.push(
          <span key={match.index} className="text-sky-400 font-semibold">
            {token}
          </span>
        );
      } else if (
        /^(VARCHAR|UUID|TIMESTAMP|BOOLEAN|NUMERIC|DECIMAL|CHAR|DATETIME|ENGINE|InnoDB|CHARSET|utf8mb4)$/i.test(
          token
        )
      ) {
        // SQL Types in amber
        parts.push(
          <span key={match.index} className="text-amber-400 font-medium">
            {token}
          </span>
        );
      } else {
        // Numbers / other tokens
        parts.push(
          <span key={match.index} className="text-purple-300">
            {token}
          </span>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <div key={lineIdx} className="leading-relaxed">
        {parts.length > 0 ? parts : "\u00A0"}
      </div>
    );
  });
}

/**
 * Interactive Live Schema Demo Workbench styled to seamlessly match the Hero section's theme,
 * 3D visual language, and color palette.
 */
export function InteractiveCanvasDemo(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<DialectTab>("postgres");
  const [copied, setCopied] = useState(false);
  const [autoTimestamps, setAutoTimestamps] = useState(true);
  const [selectedTable, setSelectedTable] = useState<"users" | "orders">("users");

  const getPostgresCode = (): string => {
    return `CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "role" VARCHAR(64) DEFAULT 'user' NOT NULL${autoTimestamps ? `,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL` : ""}
);

CREATE TABLE "orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "total_amount" NUMERIC(10, 2) NOT NULL${autoTimestamps ? `,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL` : ""},
  CONSTRAINT "fk_orders_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);`;
  };

  const getMysqlCode = (): string => {
    return `CREATE TABLE \`users\` (
  \`id\` CHAR(36) PRIMARY KEY,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`role\` VARCHAR(64) DEFAULT 'user' NOT NULL${autoTimestamps ? `,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL` : ""}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`orders\` (
  \`id\` CHAR(36) PRIMARY KEY,
  \`user_id\` CHAR(36) NOT NULL,
  \`total_amount\` DECIMAL(10,2) NOT NULL,
  CONSTRAINT \`fk_orders_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
);`;
  };

  const getQueryCode = (): string => {
    return `-- Type-Safe Relational Query
const userWithOrders = await db.query.users.findFirst({
  where: eq(users.id, "u-101"),
  with: {
    orders: {
      with: { items: true },
    },
  },
});`;
  };

  const getCurrentCode = (): string => {
    switch (activeTab) {
      case "postgres": return getPostgresCode();
      case "mysql": return getMysqlCode();
      case "query": return getQueryCode();
    }
  };

  const handleCopy = (): void => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="showcase" className="relative w-full border-b border-border/40 bg-background overflow-hidden">
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="size-125 rounded-full bg-linear-to-tr from-blue-600/10 via-indigo-500/10 to-purple-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl border-x border-border/40 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto pt-16 md:pt-24 pb-14 px-4 space-y-4">

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Design in Visual Flow. <br className="hidden sm:inline" />
            Output in Instant Code.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Interact with live schema tables below, watch relationship handles connect seamlessly, and inspect side-by-side Drizzle ORM models in real-time.
          </p>
        </div>

        {/* 2-Column Framed Grid Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/40 border-t border-border/40">
          
          {/* Left Visual ERD Canvas Panel */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-card/30">
            
            {/* Control Bar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-rose-500/80" />
                <div className="size-3 rounded-full bg-amber-500/80" />
                <div className="size-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Database className="size-3.5 text-sky-400" />
                  <span>Canvas: Ecommerce AST</span>
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setAutoTimestamps(!autoTimestamps)}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-all cursor-pointer border w-44 text-center shrink-0 ${
                  autoTimestamps 
                    ? "bg-sky-500/15 text-sky-400 border-sky-500/30 font-bold" 
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {autoTimestamps ? "✓ Timestamps Enabled" : "+ Enable Timestamps"}
              </button>
            </div>            {/* Simulated ERD Interactive Canvas Area */}
            <div className="relative flex-1 min-h-77.5 bg-card/90 backdrop-blur-md rounded-2xl p-4 border border-border/80 overflow-hidden font-sans shadow-xl flex flex-col justify-center">
              
              {/* Background Grid Pattern matching Hero theme */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[20px_20px] opacity-60 pointer-events-none" />

              {/* Connecting Line SVG matching Hero 3D beam colors (Visible on 2-column layout) */}
              <svg className="hidden sm:block absolute inset-0 size-full pointer-events-none z-10 overflow-visible">
                <defs>
                  <linearGradient id="demo-rel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 175 90 C 215 90, 215 160, 250 160" 
                  fill="none" 
                  stroke="url(#demo-rel-gradient)" 
                  strokeWidth="2.5" 
                  strokeDasharray="4 3"
                  className="animate-pulse"
                />
                <circle cx="175" cy="90" r="3.5" fill="#38bdf8" className="animate-ping" />
                <circle cx="175" cy="90" r="2.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                <circle cx="250" cy="160" r="2.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1" />
              </svg>

              <div className="relative z-20 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Table Node 1: users (Compact & Systematic Node Tile) */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTable("users")}
                  onKeyDown={e => { if (e.key === "Enter") setSelectedTable("users"); }}
                  className={cn(
                    "rounded-xl border p-3 shadow-lg transition-all cursor-pointer select-none bg-background/95 backdrop-blur-md min-h-44 flex flex-col justify-between",
                    selectedTable === "users" 
                      ? "border-sky-400/90 ring-2 ring-sky-400/25 bg-sky-500/5 shadow-sky-500/10" 
                      : "border-border/80 opacity-90 hover:opacity-100 hover:border-border/90"
                  )}
                >
                  {/* Table Header Bar */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="size-4.5 rounded bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                        <Database className="size-2.5 text-sky-400" />
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground">users</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-mono border-sky-500/30 text-sky-400 bg-sky-500/10 px-1 py-0 h-4">
                      PK: id
                    </Badge>
                  </div>
                  
                  {/* Compact Table Column Rows with Neutral Text Colors */}
                  <div className="space-y-1 text-[10.5px] font-mono flex-1 flex flex-col justify-between">
                    {/* Primary Key Column */}
                    <div className="relative flex items-center justify-between py-1 px-1.5 rounded bg-muted/60 text-foreground font-semibold border border-border/60">
                      <span className="flex items-center gap-1">
                        <Key className="size-2.5 text-muted-foreground shrink-0" />
                        <span className="text-foreground font-bold">id</span>
                      </span>
                      <span className="text-[8.5px] font-mono text-muted-foreground">UUID</span>
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 size-2 rounded-full bg-sky-400 border border-white shadow-xs" />
                    </div>

                    {/* Email Column */}
                    <div className="flex items-center justify-between py-0.5 px-1.5">
                      <span className="flex items-center gap-1">
                        <span className="text-foreground/90 font-medium">email</span>
                        <span className="text-[8px] text-muted-foreground font-mono">[UNIQ]</span>
                      </span>
                      <span className="text-[8.5px] font-mono text-muted-foreground">VARCHAR</span>
                    </div>

                    {/* Role Column */}
                    <div className="flex items-center justify-between py-0.5 px-1.5">
                      <span className="text-foreground/90 font-medium">role</span>
                      <span className="text-[8.5px] font-mono text-muted-foreground">ENUM</span>
                    </div>

                    {/* Optional Timestamp Row */}
                    {autoTimestamps && (
                      <div className="flex items-center justify-between border-t border-border/40 pt-1 px-1.5 text-[9.5px]">
                        <span className="text-muted-foreground font-medium">created_at</span>
                        <span className="text-[8.5px] font-mono text-muted-foreground">TIMESTAMPTZ</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Table Node 2: orders (Compact & Systematic Node Tile) */}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTable("orders")}
                  onKeyDown={e => { if (e.key === "Enter") setSelectedTable("orders"); }}
                  className={cn(
                    "rounded-xl border p-3 shadow-lg transition-all cursor-pointer select-none bg-background/95 backdrop-blur-md min-h-44 flex flex-col justify-between",
                    selectedTable === "orders" 
                      ? "border-indigo-400/90 ring-2 ring-indigo-400/25 bg-indigo-500/5 shadow-indigo-500/10" 
                      : "border-border/80 opacity-90 hover:opacity-100 hover:border-border/90"
                  )}
                >
                  {/* Table Header Bar */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="size-4.5 rounded bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                        <Database className="size-2.5 text-indigo-400" />
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground">orders</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-mono border-indigo-500/30 text-indigo-400 bg-indigo-500/10 px-1 py-0 h-4">
                      FK: 1
                    </Badge>
                  </div>

                  {/* Compact Table Column Rows with Neutral Text Colors */}
                  <div className="space-y-1 text-[10.5px] font-mono flex-1 flex flex-col justify-between">
                    {/* Primary Key Column */}
                    <div className="flex items-center justify-between py-0.5 px-1.5 rounded bg-muted/60 text-foreground font-semibold border border-border/60">
                      <span className="flex items-center gap-1">
                        <Key className="size-2.5 text-muted-foreground shrink-0" />
                        <span className="text-foreground font-bold">id</span>
                      </span>
                      <span className="text-[8.5px] font-mono text-muted-foreground">UUID</span>
                    </div>

                    {/* Foreign Key Column */}
                    <div className="relative flex items-center justify-between py-1 px-1.5 rounded bg-muted/60 text-foreground font-medium border border-border/60">
                      <span className="flex items-center gap-1">
                        <Link2 className="size-2.5 text-muted-foreground shrink-0" />
                        <span className="text-foreground font-bold">user_id</span>
                      </span>
                      <span className="text-[8.5px] font-mono text-muted-foreground font-bold">FK</span>
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 size-2 rounded-full bg-indigo-400 border border-white shadow-xs" />
                    </div>

                    {/* Total Amount Column */}
                    <div className="flex items-center justify-between py-0.5 px-1.5">
                      <span className="text-foreground/90 font-medium">total_amount</span>
                      <span className="text-[8.5px] font-mono text-muted-foreground">NUMERIC</span>
                    </div>

                    {/* Optional Timestamp Row */}
                    {autoTimestamps && (
                      <div className="flex items-center justify-between border-t border-border/40 pt-1 px-1.5 text-[9.5px]">
                        <span className="text-muted-foreground font-medium">created_at</span>
                        <span className="text-[8.5px] font-mono text-muted-foreground">TIMESTAMPTZ</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Code Generator Panel */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between font-mono text-xs bg-card/60 backdrop-blur-md">
            
            {/* Header Controls (Dialect Tabs + Copy) */}
            <div className="flex flex-wrap items-center justify-between border-b border-border/40 pb-3.5 gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("postgres")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer border ${
                    activeTab === "postgres"
                      ? "bg-sky-500/15 text-sky-400 border-sky-500/30 shadow-xs"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Database className="size-3.5" />
                  <span>PostgreSQL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("mysql")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer border ${
                    activeTab === "mysql"
                      ? "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-xs"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Database className="size-3.5" />
                  <span>MySQL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("query")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer border ${
                    activeTab === "query"
                      ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-xs"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Zap className="size-3.5" />
                  <span>Query</span>
                </button>
              </div>

              {/* Copy Code Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-8 cursor-pointer rounded-lg font-sans text-xs border-border/80 hover:bg-muted"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5 text-muted-foreground" />}
                <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            {/* Code Output Display Container with Syntax Highlighting */}
            <div className="flex-1 py-4 overflow-y-scroll h-80 min-h-80 leading-relaxed font-mono">
              <pre className="whitespace-pre-wrap font-mono tracking-tight text-xs bg-background/80 p-4 rounded-xl border border-border/50 min-h-full">
                {renderSyntaxHighlightedCode(getCurrentCode())}
              </pre>
            </div>

            {/* Footer Status Bar */}
            <div className="border-t border-border/40 pt-3 flex items-center justify-between text-[11px] font-sans text-muted-foreground">
              <span className="flex items-center gap-1.5 font-mono">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sync Status: Live AST Compliant</span>
              </span>
              <span className="font-semibold text-foreground">100% Type-Safe TypeScript</span>
            </div>

          </div>

        </div>

        {/* Bottom Feature Highlights Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border/40 divide-y md:divide-y-0 md:divide-x divide-border/40">
          
          <div className="p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <Zap className="size-4 text-sky-400" />
              <span>Zero-Latency AST Engine</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Schema changes compile to code in under 10ms without page reloads or web worker lag.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <ShieldCheck className="size-4 text-indigo-400" />
              <span>Type-Safe Autocomplete</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Production-ready Drizzle ORM TypeScript models out of the box for immediate database queries.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <RefreshCw className="size-4 text-emerald-400" />
              <span>Universal Multi-Dialect</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instant 1-click conversion between SQLite, PostgreSQL, MySQL & LibSQL DDLs.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
