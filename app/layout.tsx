import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ShortcutProvider } from "@/providers/ShortcutProvider";
import { TooltipProvider } from "@schema-flow/components/ui/tooltip";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { GlobalCreateTableDialog } from "@/components/modals/GlobalCreateTableDialog";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
  adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://schemaflow-studio.vercel.app"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Schema Flow Studio - Visual Database Schema Builder & Drizzle ORM Designer",
    template: "%s | Schema Flow Studio",
  },
  description: "Visually design database architectures, auto-generate type-safe Drizzle ORM models & migrations, export production-ready SQL DDL, and generate TypeScript types in real-time.",
  applicationName: "Schema Flow Studio",
  keywords: [
    "visual database designer",
    "ERD tool",
    "database schema builder",
    "Drizzle ORM generator",
    "Drizzle schema designer",
    "SQL generator",
    "PostgreSQL ERD builder",
    "MySQL schema designer",
    "SQLite schema builder",
    "Turso database visualizer",
    "LibSQL schema editor",
    "TypeScript types generator",
    "database architecture tool",
    "database diagram builder",
    "database visualization tool",
    "open source ERD tool",
    "local-first database designer",
    "cloud database visualizer",
  ],
  authors: [{ name: "MRADUL KUMAR Katiyar", url: "https://mk-katiyar.in" }],
  creator: "MRADUL KUMAR Katiyar",
  publisher: "MRADUL KUMAR Katiyar",
  category: "Developer Tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Schema Flow Studio - Visual Database Schema Builder & Drizzle ORM Designer",
    description: "Visually design database architectures, auto-generate type-safe Drizzle ORM models & migrations, export production-ready SQL DDL, and generate TypeScript types in real-time.",
    url: "https://schemaflow-studio.vercel.app",
    siteName: "Schema Flow Studio",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Schema Flow Studio Visual Database Designer Interface",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Schema Flow Studio - Visual Database Schema Builder & Drizzle ORM Designer",
    description: "Visually design database architectures, auto-generate type-safe Drizzle ORM models & migrations, export production-ready SQL DDL, and generate TypeScript types.",
    images: ["/og-image.png"],
  },
};

import { Toaster } from "@schema-flow/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { DevelopmentBanner } from "@schema-flow/components/ui/developmentBanner";
import { FloatingThemeToggle } from "@schema-flow/components/ui/floatingThemeToggle";
import { CookieConsent } from "@schema-flow/components/ui/cookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`dark ${interSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var s=localStorage.getItem("schema-flow-theme");if(s==="light"){document.documentElement.classList.remove("dark");document.documentElement.classList.add("light");}else{document.documentElement.classList.remove("light");document.documentElement.classList.add("dark");}}catch(e){}})();`,
            }}
          />
        </head>
        <body className="h-full min-h-screen flex flex-col bg-background text-foreground antialiased">
          <ThemeProvider>
            <ShortcutProvider>
              <TooltipProvider delay={400}>
                <DevelopmentBanner />
                {children}
                <CommandMenu />
                <GlobalCreateTableDialog />
                <FloatingThemeToggle />
                <CookieConsent />
                <Toaster position="bottom-right" richColors />
              </TooltipProvider>
            </ShortcutProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
