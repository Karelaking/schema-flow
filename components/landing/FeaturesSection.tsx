import React from "react";
import { 
  Zap, 
  Code2, 
  Cloud, 
  Layers, 
  Terminal, 
  ShieldAlert,
  CheckCircle2
} from "lucide-react";

export function FeaturesSection(): React.JSX.Element {
  const features = [
    {
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      title: "Drizzle ORM Native Integration",
      description: "Generate type-safe Drizzle ORM schemas, relational mappings (`relations`), and migration DDLs instantly from your visual diagram.",
    },
    {
      icon: Code2,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
      title: "Multi-Dialect Code Export",
      description: "Seamlessly convert schemas between Drizzle ORM, SQLite, PostgreSQL, and MySQL dialects with a single click.",
    },
    {
      icon: Cloud,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      title: "Turso & Local File Storage",
      description: "Supports local SQLite databases (`file:./data/schema-flow.db`) and Turso Edge Cloud databases (`libsql://...`).",
    },
    {
      icon: Layers,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      title: "Interactive ERD Node Canvas",
      description: "Drag and drop tables, customize column types, set primary/foreign keys, auto-arrange layouts, and export visual diagram images.",
    },
    {
      icon: Terminal,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      title: "Interactive Query Builder",
      description: "Generate SELECT, INSERT, UPDATE, and DELETE queries for any table in your project with customizable parameters.",
    },
    {
      icon: ShieldAlert,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      title: "Real-Time AST Validator",
      description: "Automatic background checks flag missing foreign keys, duplicate column names, circular dependencies, and invalid indexes.",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything You Need for Modern Database Architecture
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Built from the ground up to empower developers, database administrators, and software architects.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="group relative rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`inline-flex size-12 items-center justify-center rounded-xl ${feat.bgColor} ${feat.color} mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-card-foreground group-hover:text-primary transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 border-t pt-4 border-border/40 flex items-center text-xs font-semibold text-primary gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Production Ready</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
