import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ShortcutProvider } from "@/providers/ShortcutProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { GlobalCreateTableDialog } from "@/components/modals/GlobalCreateTableDialog";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
  adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://schemaflow.dev"),
  title: {
    default: "Schema Flow - Visual Database Schema & Drizzle ORM Designer",
    template: "%s | Schema Flow",
  },
  description: "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export production-ready SQL, and generate TypeScript types in real-time.",
  applicationName: "Schema Flow",
  keywords: [
    "visual database designer",
    "ERD tool",
    "database schema builder",
    "Drizzle ORM generator",
    "SQL generator",
    "PostgreSQL ERD",
    "MySQL schema designer",
    "SQLite schema builder",
    "TypeScript types generator",
    "database architecture tool",
  ],
  authors: [{ name: "Schema Flow Team" }],
  creator: "Schema Flow",
  publisher: "Schema Flow",
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
    title: "Schema Flow - Visual Database Schema & Drizzle ORM Designer",
    description: "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export production-ready SQL, and generate TypeScript types in real-time.",
    url: "https://schemaflow.dev",
    siteName: "Schema Flow",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Schema Flow Visual Database Designer Interface",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Schema Flow - Visual Database Schema & Drizzle ORM Designer",
    description: "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export production-ready SQL, and generate TypeScript types.",
    images: ["/og-image.png"],
  },
};

import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${interSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
          <ThemeProvider>
            <ShortcutProvider>
              <TooltipProvider delay={400}>
                {children}
                <CommandMenu />
                <GlobalCreateTableDialog />
                <Toaster position="bottom-right" richColors />
              </TooltipProvider>
            </ShortcutProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
