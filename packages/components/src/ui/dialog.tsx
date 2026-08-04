"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "./button";

/**
 * Dialog root — manages open/close state.
 */
const Dialog = ({ ...props }: DialogPrimitive.Root.Props): React.JSX.Element => {
    return <DialogPrimitive.Root data-slot="dialog" {...props} />;
};

/**
 * Dialog trigger — wraps the element that opens the dialog.
 */
const DialogTrigger = ({ ...props }: DialogPrimitive.Trigger.Props): React.JSX.Element => {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
};

/**
 * Dialog portal — renders children into a portal.
 */
const DialogPortal = ({ ...props }: DialogPrimitive.Portal.Props): React.JSX.Element => {
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
};

/**
 * Dialog close — wraps the element that closes the dialog.
 */
const DialogClose = ({ ...props }: DialogPrimitive.Close.Props): React.JSX.Element => {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
};

/**
 * Dialog overlay — semi-transparent backdrop behind the dialog.
 */
const DialogOverlay = ({
    className,
    ...props
}: DialogPrimitive.Backdrop.Props): React.JSX.Element => {
    return (
        <DialogPrimitive.Backdrop
            data-slot="dialog-overlay"
            className={cn(
                "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
                className
            )}
            {...props}
        />
    );
};

/**
 * Props for the DialogContent component.
 */
type DialogContentProps = DialogPrimitive.Popup.Props & {
    showCloseButton?: boolean;
};

/**
 * Dialog content — the centered modal popup with optional close button.
 * Follows Single Responsibility: overlay rendering is delegated to DialogOverlay.
 *
 * @param props - Popup props and optional showCloseButton flag.
 * @returns A positioned dialog popup element.
 */
const DialogContent = ({
    className,
    children,
    showCloseButton = true,
    ...props
}: DialogContentProps): React.JSX.Element => {
    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Popup
                data-slot="dialog-content"
                className={cn(
                    "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close
                        data-slot="dialog-close"
                        render={
                            <Button
                                variant="ghost"
                                className="absolute top-2 right-2"
                                size="icon-sm"
                            />
                        }
                    >
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Popup>
        </DialogPortal>
    );
};

/**
 * Dialog header — flex column layout for title and description.
 */
const DialogHeader = ({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element => {
    return (
        <div
            data-slot="dialog-header"
            className={cn("flex flex-col gap-2", className)}
            {...props}
        />
    );
};

/**
 * Props for the DialogFooter component.
 */
type DialogFooterProps = React.ComponentProps<"div"> & {
    showCloseButton?: boolean;
};

/**
 * Dialog footer — renders action buttons with optional auto-close button.
 */
const DialogFooter = ({
    className,
    showCloseButton = false,
    children,
    ...props
}: DialogFooterProps): React.JSX.Element => {
    return (
        <div
            data-slot="dialog-footer"
            className={cn(
                "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
                className
            )}
            {...props}
        >
            {children}
            {showCloseButton && (
                <DialogPrimitive.Close render={<Button variant="outline" />}>
                    Close
                </DialogPrimitive.Close>
            )}
        </div>
    );
};

/**
 * Dialog title — accessible heading for the dialog.
 */
const DialogTitle = ({ className, ...props }: DialogPrimitive.Title.Props): React.JSX.Element => {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn(
                "font-heading text-base leading-none font-medium",
                className
            )}
            {...props}
        />
    );
};

/**
 * Dialog description — supplementary text below the title.
 */
const DialogDescription = ({
    className,
    ...props
}: DialogPrimitive.Description.Props): React.JSX.Element => {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            className={cn(
                "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
                className
            )}
            {...props}
        />
    );
};

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
