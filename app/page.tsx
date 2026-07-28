import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DrizzleSection } from "@/components/landing/DrizzleSection";
import { Footer } from "@/components/landing/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const InteractiveCanvasDemo = dynamic(
  () => import("@/components/landing/InteractiveCanvasDemo").then(mod => mod.InteractiveCanvasDemo),
  {
    loading: () => (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="w-full h-112.5 rounded-xl border border-border/40" />
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "Schema Flow - Visual Database Schema builder",
  description: "Visually design database architectures, export raw SQL, and sync with Turso Edge Cloud.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Schema Flow",
  "operatingSystem": "Web",
  "applicationCategory": "DeveloperApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "description": "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export raw SQL, and generate TypeScript types in real-time.",
  "url": "https://schemaflow.dev",
  "featureList": [
    "Visual ERD Database Canvas",
    "SQL query builder",
    "Type script models",
    "JSON schema builder",
    "AI Schema Assistant",
    "Generate SQL queries"
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <InteractiveCanvasDemo />
        <FeaturesSection />
        <DrizzleSection />
      </main>
      <Footer />
    </div>
  );
}
