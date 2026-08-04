"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "./button";

/**
 * Sheet root — manages open/close state for slide-over panels.
 */
const Sheet = ({ ...props }: SheetPrimitive.Root.Props): React.JSX.Element => {
    return <SheetPrimitive.Root data-slot="sheet" {...props} />;
};

/**
 * Sheet trigger — wraps the element that opens the sheet.
 */
const SheetTrigger = ({ ...props }: SheetPrimitive.Trigger.Props): React.JSX.Element => {
    return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
};

/**
 * Sheet close — wraps the element that closes the sheet.
 */
const SheetClose = ({ ...props }: SheetPrimitive.Close.Props): React.JSX.Element => {
    return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
};

/**
 * Sheet portal — renders children into a portal.
 */
const SheetPortal = ({ ...props }: SheetPrimitive.Portal.Props): React.JSX.Element => {
    return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
};

/**
 * Sheet overlay — semi-transparent backdrop behind the sheet.
 */
const SheetOverlay = ({ className, ...props }: SheetPrimitive.Backdrop.Props): React.JSX.Element => {
    return (
        <SheetPrimitive.Backdrop
            data-slot="sheet-overlay"
            className={cn(
                "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
                className
            )}
            {...props}
        />
    );
};

/**
 * Props for the SheetContent component.
 */
type SheetContentProps = SheetPrimitive.Popup.Props & {
    side?: "top" | "right" | "bottom" | "left";
    showCloseButton?: boolean;
};

/**
 * Sheet content — the sliding panel that appears from a configurable side.
 * Follows SRP: overlay rendering is delegated to SheetOverlay.
 *
 * @param props - Sheet popup props, side variant, and close button toggle.
 * @returns A styled sheet panel element.
 */
const SheetContent = ({
    className,
    children,
    side = "right",
    showCloseButton = true,
    ...props
}: SheetContentProps): React.JSX.Element => {
    return (
        <SheetPortal>
            <SheetOverlay />
            <SheetPrimitive.Popup
                data-slot="sheet-content"
                data-side={side}
                className={cn(
                    "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-10 data-[side=bottom]:data-starting-style:translate-y-10 data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:-translate-x-10 data-[side=left]:data-starting-style:-translate-x-10 data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-10 data-[side=right]:data-starting-style:translate-x-10 data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:-translate-y-10 data-[side=top]:data-starting-style:-translate-y-10 data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <SheetPrimitive.Close
                        data-slot="sheet-close"
                        render={
                            <Button
                                variant="ghost"
                                className="absolute top-3 right-3"
                                size="icon-sm"
                            />
                        }
                    >
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </SheetPrimitive.Close>
                )}
            </SheetPrimitive.Popup>
        </SheetPortal>
    );
};

/**
 * Sheet header — layout container for title and description.
 */
const SheetHeader = ({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element => {
    return (
        <div
            data-slot="sheet-header"
            className={cn("flex flex-col gap-0.5 p-4", className)}
            {...props}
        />
    );
};

/**
 * Sheet footer — action container pinned to the bottom.
 */
const SheetFooter = ({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element => {
    return (
        <div
            data-slot="sheet-footer"
            className={cn("mt-auto flex flex-col gap-2 p-4", className)}
            {...props}
        />
    );
};

/**
 * Sheet title — accessible heading for the sheet.
 */
const SheetTitle = ({ className, ...props }: SheetPrimitive.Title.Props): React.JSX.Element => {
    return (
        <SheetPrimitive.Title
            data-slot="sheet-title"
            className={cn(
                "font-heading text-base font-medium text-foreground",
                className
            )}
            {...props}
        />
    );
};

/**
 * Sheet description — supplementary text below the title.
 */
const SheetDescription = ({
    className,
    ...props
}: SheetPrimitive.Description.Props): React.JSX.Element => {
    return (
        <SheetPrimitive.Description
            data-slot="sheet-description"
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
};

export {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
};
