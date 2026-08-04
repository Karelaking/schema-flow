"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "../lib/utils";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

/**
 * Props for the Command component.
 */
export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Command root — wraps the cmdk command palette primitive.
 * Falls back to a plain div when cmdk is unavailable.
 */
const Command = React.forwardRef<HTMLDivElement, CommandProps>(
    ({ className, ...props }, ref): React.JSX.Element => {
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

/**
 * Props for the CommandDialog component.
 */
export interface CommandDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

/**
 * CommandDialog — renders a Command palette inside a Dialog overlay.
 * Follows SRP: delegates dialog behavior to Dialog and command behavior to Command.
 */
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

/**
 * Props for the CommandInput component.
 */
export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * CommandInput — search input with built-in search icon.
 */
const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
    ({ className, ...props }, ref): React.JSX.Element => (
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 size-4 shrink-0 opacity-50 text-muted-foreground" />
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

/**
 * Props for the CommandList component.
 */
export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * CommandList — scrollable container for command results.
 */
const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
    ({ className, ...props }, ref): React.JSX.Element => (
        <div
            ref={ref}
            data-slot="command-list"
            className={cn("max-h-75 overflow-y-auto overflow-x-hidden p-1", className)}
            {...props}
        />
    )
);
CommandList.displayName = "CommandList";

/**
 * Props for the CommandEmpty component.
 */
export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * CommandEmpty — displayed when no results match the search.
 */
const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
    ({ className, ...props }, ref): React.JSX.Element => (
        <div
            ref={ref}
            data-slot="command-empty"
            className={cn("py-6 text-center text-sm text-muted-foreground", className)}
            {...props}
        />
    )
);
CommandEmpty.displayName = "CommandEmpty";

/**
 * Props for the CommandGroup component.
 */
export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    heading?: React.ReactNode;
}

/**
 * CommandGroup — groups related command items with an optional heading.
 */
const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
    ({ className, heading, children, ...props }, ref): React.JSX.Element => (
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

/**
 * Props for the CommandSeparator component.
 */
export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * CommandSeparator — visual divider between command groups.
 */
const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
    ({ className, ...props }, ref): React.JSX.Element => (
        <div
            ref={ref}
            data-slot="command-separator"
            className={cn("-mx-1 h-px bg-border", className)}
            {...props}
        />
    )
);
CommandSeparator.displayName = "CommandSeparator";

/**
 * Props for the CommandItem component.
 */
export interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
    onSelect?: () => void;
}

/**
 * CommandItem — individual interactive item within a command group.
 * Supports both click and keyboard activation.
 */
const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
    ({ className, onSelect, onClick, ...props }, ref): React.JSX.Element => (
        <div
            ref={ref}
            role="option"
            tabIndex={0}
            data-slot="command-item"
            onClick={e => {
                if (onSelect) { onSelect(); }
                if (onClick) { onClick(e); }
            }}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                    if (onSelect) { onSelect(); }
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

/**
 * CommandShortcut — keyboard shortcut indicator within a command item.
 */
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
