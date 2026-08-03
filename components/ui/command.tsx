"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
    ({ className, ...props }, ref) => {
        if (typeof CommandPrimitive === "function") {
            return (
                <CommandPrimitive
                    ref={ref as any}
                    className={cn(
                        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
                        className
                    )}
                    {...props}
                />
            );
        }
        return (
            <div
                ref={ref}
                data-slot="command"
                className={cn(
                    "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
                    className
                )}
                {...props}
            />
        );
    }
);
Command.displayName = "Command";

export interface CommandDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

const CommandDialog = ({ open, onOpenChange, children }: CommandDialogProps): React.ReactElement => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden p-0 shadow-lg border max-w-xl bg-card">
                <DialogTitle className="sr-only">Command Menu</DialogTitle>
                <Command className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group]]:px-2 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-2.5">
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    );
};

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
    ({ className, ...props }, ref) => (
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
            <input
                ref={ref}
                data-slot="command-input"
                className={cn(
                    "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-foreground font-medium",
                    className
                )}
                {...props}
            />
        </div>
    )
);
CommandInput.displayName = "CommandInput";

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            data-slot="command-list"
            className={cn("max-h-75 overflow-y-auto overflow-x-hidden p-1", className)}
            {...props}
        />
    )
);
CommandList.displayName = "CommandList";

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            data-slot="command-empty"
            className={cn("py-6 text-center text-sm text-muted-foreground", className)}
            {...props}
        />
    )
);
CommandEmpty.displayName = "CommandEmpty";

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    heading?: React.ReactNode;
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
    ({ className, heading, children, ...props }, ref) => (
        <div
            ref={ref}
            data-slot="command-group"
            className={cn(
                "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-muted-foreground",
                className
            )}
            {...props}
        >
            {heading && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {heading}
                </div>
            )}
            {children}
        </div>
    )
);
CommandGroup.displayName = "CommandGroup";

export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            data-slot="command-separator"
            className={cn("-mx-1 h-px bg-border", className)}
            {...props}
        />
    )
);
CommandSeparator.displayName = "CommandSeparator";

export interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
    onSelect?: () => void;
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
    ({ className, onSelect, onClick, ...props }, ref) => (
        <div
            ref={ref}
            role="option"
            tabIndex={0}
            data-slot="command-item"
            onClick={e => {
                if (onSelect) onSelect();
                if (onClick) onClick(e);
            }}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                    if (onSelect) onSelect();
                }
            }}
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:bg-accent hover:bg-accent hover:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 text-foreground transition-colors",
                className
            )}
            {...props}
        />
    )
);
CommandItem.displayName = "CommandItem";

const CommandShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement => {
    return (
        <span
            className={cn(
                "ml-auto text-xs tracking-widest text-muted-foreground",
                className
            )}
            {...props}
        />
    );
};
CommandShortcut.displayName = "CommandShortcut";

export {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
};
