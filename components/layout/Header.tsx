import React from "react";
import { ProjectSwitcher } from "@/components/modals/ProjectSwitcher";
import { HeaderMenuBar } from "@/components/layout/HeaderMenuBar";
import { HeaderActions } from "@/components/layout/HeaderActions";

/**
 * Top-level Header Component: Static Server Component layout shell.
 */
export const Header: React.FC = (): React.ReactElement => {
    return (
        <header className="relative flex h-14 items-center justify-between border-b bg-card px-3 sm:px-6 text-card-foreground">
            <div className="flex items-center min-w-0">
                <ProjectSwitcher />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
                <HeaderActions />
                <HeaderMenuBar />
            </div>
        </header>
    );
};

export default Header;
