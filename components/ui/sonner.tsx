"use client";

import React, { useState, useEffect } from "react";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";
import { useTheme } from "@/providers/ThemeProvider";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastItem {
    id: string;
    type: "success" | "error" | "info" | "default";
    message: string;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toastsStore: ToastItem[] = [];
const listeners = new Set<ToastListener>();

const notify = (): void => {
    listeners.forEach(listener => listener([...toastsStore]));
};

export const toast = {
    success: (message: string): void => {
        try {
            if (typeof sonnerToast?.success === "function") {
                sonnerToast.success(message);
            }
        } catch {
            // fallback
        }
        const id = Math.random().toString(36).substring(2, 9);
        toastsStore = [...toastsStore, { id, type: "success", message }];
        notify();
        setTimeout(() => toast.dismiss(id), 3500);
    },
    error: (message: string): void => {
        try {
            if (typeof sonnerToast?.error === "function") {
                sonnerToast.error(message);
            }
        } catch {
            // fallback
        }
        const id = Math.random().toString(36).substring(2, 9);
        toastsStore = [...toastsStore, { id, type: "error", message }];
        notify();
        setTimeout(() => toast.dismiss(id), 4500);
    },
    info: (message: string): void => {
        try {
            if (typeof sonnerToast?.info === "function") {
                sonnerToast.info(message);
            }
        } catch {
            // fallback
        }
        const id = Math.random().toString(36).substring(2, 9);
        toastsStore = [...toastsStore, { id, type: "info", message }];
        notify();
        setTimeout(() => toast.dismiss(id), 3500);
    },
    dismiss: (id?: string): void => {
        try {
            if (typeof sonnerToast?.dismiss === "function") {
                sonnerToast.dismiss(id);
            }
        } catch {
            // fallback
        }
        if (id) {
            toastsStore = toastsStore.filter(t => t.id !== id);
            notify();
        }
    },
};

export interface ToasterProps {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    richColors?: boolean;
}

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
            ) : null}

            {activeToasts.length > 0 && (
                <div
                    role="status"
                    aria-live="polite"
                    aria-label="Notifications"
                    className={`fixed z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none ${
                        position === "bottom-right" ? "bottom-4 right-4" : "bottom-4 left-4"
                    }`}
                >
                    {activeToasts.map(t => (
                        <div
                            key={t.id}
                            className="pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-lg text-xs font-medium animate-in fade-in-0 slide-in-from-bottom-2"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                {t.type === "success" && (
                                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                )}
                                {t.type === "error" && (
                                    <AlertCircle className="size-4 text-destructive shrink-0" />
                                )}
                                {t.type === "info" && (
                                    <Info className="size-4 text-blue-500 shrink-0" />
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
                    ))}
                </div>
            )}
        </>
    );
};
