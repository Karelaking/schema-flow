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
  metadataBase: new URL("https://schemaflow-studio.vercel.app"),
  title: {
    default: "Schema Flow Studio - Visual Database Schema & Drizzle ORM Designer",
    template: "%s | Schema Flow Studio",
  },
  description: "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export production-ready SQL, and generate TypeScript types in real-time.",
  applicationName: "Schema Flow Studio",
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
    "database diagram",
    "database design tool",
    "database visualization tool",
    "database schema visualization tool",
    "Export to image",  
    "local database designer",
    "cloud database designer",
    "",
    
  ],
  authors: [{ name: "Schema Flow Studio Team" }],
  creator: "Schema Flow Studio",
  publisher: "Schema Flow Studio",
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
    title: "Schema Flow Studio - Visual Database Schema & Drizzle ORM Designer",
    description: "Visually design database architectures, auto-generate Drizzle ORM models & migrations, export production-ready SQL, and generate TypeScript types in real-time.",
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
    title: "Schema Flow Studio - Visual Database Schema & Drizzle ORM Designer",
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
