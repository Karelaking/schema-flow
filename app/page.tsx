import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { Skeleton } from "@/components/ui/skeleton";

const LogoCloudSection = dynamic(
  () => import("@/components/landing/LogoCloudSection").then(mod => mod.LogoCloudSection)
);

const FeaturesSection = dynamic(
  () => import("@/components/landing/FeaturesSection").then(mod => mod.FeaturesSection)
);

const PricingSection = dynamic(
  () => import("@/components/landing/PricingSection").then(mod => mod.PricingSection)
);

const Footer = dynamic(
  () => import("@/components/landing/Footer").then(mod => mod.Footer)
);

const InteractiveCanvasDemo = dynamic(
  () => import("@/components/landing/InteractiveCanvasDemo").then(mod => mod.InteractiveCanvasDemo),
  {
    loading: () => (
      <div className="w-full bg-background border-b border-border/40 py-16 md:py-24">
        <div className="mx-auto max-w-7xl border-x border-border/40 px-4 sm:px-6 lg:px-8">
          <Skeleton className="w-full h-112.5 rounded-xl border border-border/40" />
        </div>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "Schema Flow Studio - Visual Database Schema Builder & Drizzle ORM Designer",
  description: "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export raw SQL, and sync with Turso Edge Cloud.",
  openGraph: {
    title: "Schema Flow Studio - Visual Database Schema Builder",
    description: "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export raw SQL, and sync with Turso Edge Cloud.",
    url: "https://schemaflow-studio.vercel.app",
    siteName: "Schema Flow Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Schema Flow Studio - Visual Database Schema Builder",
    description: "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export raw SQL.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Schema Flow Studio",
  "operatingSystem": "Web",
  "applicationCategory": "DeveloperApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "description": "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export raw SQL, and generate TypeScript types in real-time.",
  "url": "https://schemaflow-studio.vercel.app",
  "featureList": [
    "Visual ERD Database Canvas",
    "SQL query builder",
    "Type script models and interfaces",
    "JSON schema builder",
    "AI Schema Assistant",
    "Generate SQL queries",
    "Export to image",
    "Sync with Turso Edge Cloud",
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
        <LogoCloudSection />
        <InteractiveCanvasDemo />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
