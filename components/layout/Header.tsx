import Link from "next/link";
import { Database } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ProjectSwitcher } from "@/components/modals/ProjectSwitcher";
import { CenterControls } from "@/components/modals/CenterControls";
import { HeaderActions } from "@/components/layout/HeaderActions";

/**
 * Top-level Header Component: Static Server Component layout shell.
 */
export function Header(): React.JSX.Element {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6 text-card-foreground">
      {/* Left: Project Branding & Switcher */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs group-hover:scale-105 transition-transform">
            <Database className="size-4" />
          </div>
          <span className="font-bold text-sm tracking-tight hidden sm:inline-block">Schema Flow</span>
        </Link>

        <Separator orientation="vertical" className="h-10 hidden sm:block" />

        <ProjectSwitcher />
      </div>

      {/* Center Controls */}
      <div className="hidden md:flex items-center gap-1">
        <CenterControls />
      </div>

      {/* Right Controls: Export, Import, Theme Toggle */}
      <HeaderActions />
    </header>
  );
}

export default Header;
