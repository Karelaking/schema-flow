import { useState, useEffect } from "react";

interface PanelResizing {
    leftWidth: number;
    rightWidth: number;
    resizingSide: "left" | "right" | undefined;
    setResizingSide: (side: "left" | "right" | undefined) => void;
}

/**
 * Custom Hook: Manages workspace sidebar panel resizing, mouse interactions, and persistent settings.
 */
export function usePanelResizing(): PanelResizing {
    const [leftWidth, setLeftWidth] = useState(256);
    const [rightWidth, setRightWidth] = useState(400);
    const [resizingSide, setResizingSide] = useState<"left" | "right" | undefined>(undefined);

    useEffect(() => {
        const savedLeft = localStorage.getItem("schema-flow:left-width");
        const savedRight = localStorage.getItem("schema-flow:right-width");
        if (savedLeft) {
            setLeftWidth(parseInt(savedLeft, 10));
        }
        if (savedRight) {
            setRightWidth(parseInt(savedRight, 10));
        }
    }, []);

    useEffect(() => {
        if (!resizingSide) {
            return;
        }

        const winWidth = window.innerWidth;
        let rafId: number | null = null;
        let currentLeft = leftWidth;
        let currentRight = rightWidth;

        const handleMouseMove = (e: MouseEvent): void => {
            const clientX = e.clientX;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }

            rafId = requestAnimationFrame(() => {
                if (resizingSide === "left") {
                    const newWidth = Math.max(180, Math.min(400, clientX));
                    currentLeft = newWidth;
                    setLeftWidth(newWidth);
                }
                else if (resizingSide === "right") {
                    const newWidth = Math.max(320, Math.min(600, winWidth - clientX));
                    currentRight = newWidth;
                    setRightWidth(newWidth);
                }
            });
        };

        const handleMouseUp = (): void => {
            if (resizingSide === "left") {
                localStorage.setItem("schema-flow:left-width", String(currentLeft));
            }
            else if (resizingSide === "right") {
                localStorage.setItem("schema-flow:right-width", String(currentRight));
            }
            setResizingSide(undefined);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };
    }, [resizingSide, leftWidth, rightWidth]);

    return {
        leftWidth,
        rightWidth,
        resizingSide,
        setResizingSide,
    };
}
