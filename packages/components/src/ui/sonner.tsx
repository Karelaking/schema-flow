"use client";

import React, { useState, useEffect } from "react";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";
import { useTheme } from "@/providers/ThemeProvider";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

/**
 * Represents a single toast notification item.
 */
export interface ToastItem {
    id: string;
    type: "success" | "error" | "info" | "default";
    message: string;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toastsStore: ToastItem[] = [];
const listeners = new Set<ToastListener>();

/**
 * Notifies all registered listeners of toast state changes.
 */
const notify = (): void => {
    listeners.forEach(listener => listener([...toastsStore]));
};

/**
 * Generates a unique identifier for toast items.
 * @returns A short random string.
 */
const generateToastId = (): string => {
    return Math.random().toString(36).substring(2, 9);
};

/**
 * Attempts to call a sonner toast method with graceful fallback.
 * Follows DRY — extracts the repeated try/catch pattern from each toast method.
 *
 * @param method - The sonner method to invoke.
 * @param args - Arguments to pass to the method.
 */
const trySonner = (method: "success" | "error" | "info" | "dismiss", ...args: unknown[]): void => {
    try {
        const fn = sonnerToast?.[method];
        if (typeof fn === "function") {
            (fn as (...a: unknown[]) => void)(...args);
        }
    } catch {
        // Graceful fallback — sonner may not be mounted.
    }
};

/**
 * Creates a toast notification with automatic dismissal.
 * Follows DRY — extracts the repeated toast creation pattern.
 *
 * @param type - Toast variant type.
 * @param message - Display message.
 * @param dismissMs - Auto-dismiss delay in milliseconds.
 */
const createToast = (type: ToastItem["type"], message: string, dismissMs: number): void => {
    const id = generateToastId();
    toastsStore = [...toastsStore, { id, type, message }];
    notify();
    setTimeout(() => toast.dismiss(id), dismissMs);
};

/**
 * Toast API — provides success, error, info, and dismiss methods.
 * Uses a lightweight internal store with listener pattern for state management.
 */
export const toast = {
    success: (message: string): void => {
        trySonner("success", message);
        createToast("success", message, 3500);
    },
    error: (message: string): void => {
        trySonner("error", message);
        createToast("error", message, 4500);
    },
    info: (message: string): void => {
        trySonner("info", message);
        createToast("info", message, 3500);
    },
    dismiss: (id?: string): void => {
        trySonner("dismiss", id);
        if (id) {
            toastsStore = toastsStore.filter(t => t.id !== id);
            notify();
        }
    },
};

/**
 * Props for the Toaster component.
 */
export interface ToasterProps {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    richColors?: boolean;
}

/**
 * Icon mapping for toast types — follows Open/Closed principle.
 * Add new toast types by extending this map, not modifying the render logic.
 */
const TOAST_ICON_MAP: Record<string, { icon: React.FC<React.SVGProps<SVGSVGElement>>; className: string }> = {
    success: { icon: CheckCircle2, className: "size-4 text-emerald-500 shrink-0" },
    error: { icon: AlertCircle, className: "size-4 text-destructive shrink-0" },
    info: { icon: Info, className: "size-4 text-blue-500 shrink-0" },
};

/**
 * Toaster component — renders both sonner toasts and a fallback notification stack.
 * Follows SRP: the toast API handles state, the Toaster only handles rendering.
 *
 * @param props - Toaster configuration props.
 * @returns A toast notification container element.
 */
export const Toaster: React.FC<ToasterProps> = ({
    position = "bottom-right",
    richColors = true,
}): React.ReactElement => {
    const { theme = "dark" } = useTheme();
    const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        const handleUpdate = (toasts: ToastItem[]): void => {
            setActiveToasts(toasts);
        };
        listeners.add(handleUpdate);
        return () => {
            listeners.delete(handleUpdate);
        };
    }, []);

    return (
        <>
            {typeof Sonner === "function" ? (
                <Sonner theme={theme as any} position={position as any} richColors={richColors} />
            ) : undefined}

            {activeToasts.length > 0 && (
                <div
                    role="status"
                    aria-live="polite"
                    aria-label="Notifications"
                    className={`fixed z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none ${
                        position === "bottom-right" ? "bottom-4 right-4" : "bottom-4 left-4"
                    }`}
                >
                    {activeToasts.map(t => {
                        const iconEntry = TOAST_ICON_MAP[t.type];
                        return (
                            <div
                                key={t.id}
                                className="pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-lg text-xs font-medium animate-in fade-in-0 slide-in-from-bottom-2"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {iconEntry && (
                                        <iconEntry.icon className={iconEntry.className} />
                                    )}
                                    <span className="truncate">{t.message}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toast.dismiss(t.id)}
                                    className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer p-0.5 rounded"
                                    aria-label="Dismiss notification"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};
