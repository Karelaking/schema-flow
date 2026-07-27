import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { InteractiveCanvasDemo } from "@/components/landing/InteractiveCanvasDemo";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DrizzleSection } from "@/components/landing/DrizzleSection";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Schema Flow - Visual Database Schema & Drizzle ORM Designer",
  description: "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export raw SQL, and sync with Turso Edge Cloud.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary">
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
