import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

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
          <TooltipProvider delay={400}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
