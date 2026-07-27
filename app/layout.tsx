import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ShortcutProvider } from "@/providers/ShortcutProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandMenu } from "@/components/layout/CommandMenu";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schema Flow - Visual Database Schema Designer",
  description: "Visually design database architectures, manage projects, and generate production-ready SQL and TypeScript code.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Schema Flow - Visual Database Schema Designer",
    description: "Visually design database architectures, manage projects, and generate production-ready SQL and TypeScript code.",
    url: "https://schemaflow.dev",
    siteName: "Schema Flow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Schema Flow Visual Database Designer",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Schema Flow - Visual Database Schema Designer",
    description: "Visually design database architectures, manage projects, and generate production-ready SQL and TypeScript code.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
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
            </TooltipProvider>
          </ShortcutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
