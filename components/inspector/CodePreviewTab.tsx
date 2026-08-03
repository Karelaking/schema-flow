"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Copy, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Editor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full min-h-75" />,
});
import { useStore } from "@/lib/store";
import { useTheme } from "@/providers/ThemeProvider";
import { getGeneratorForDialect, createTypescriptGenerator } from "@/packages/generators";
import { SchemaAST } from "@/packages/schema-core";
import { Button } from "@/components/ui/button";

/**
 * Renders live SQL DDL and TypeScript type code generation via Monaco Editor.
 */
export const CodePreviewTab: React.FC = (): React.ReactElement => {
    const { theme } = useTheme();
    const projectId = useStore(state => state.projectId);
    const projectName = useStore(state => state.projectName);
    const projectDescription = useStore(state => state.projectDescription);
    const dialect = useStore(state => state.dialect);
    const autoAddId = useStore(state => state.autoAddId);
    const autoAddTimestamps = useStore(state => state.autoAddTimestamps);
    const tables = useStore(state => state.tables);
    const relations = useStore(state => state.relations);
    const enums = useStore(state => state.enums);

    const [codeType, setCodeType] = useState<"sql" | "typescript">("sql");
    const [copied, setCopied] = useState(false);
    const [formattedCode, setFormattedCode] = useState<string>("");

    const currentAST: SchemaAST = useMemo(() => ({
        project: {
            id: projectId || "temp-id",
            name: projectName,
            description: projectDescription,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        },
        settings: {
            dialect,
            theme,
            autoAddId,
            autoAddTimestamps,
        },
        tables,
        relations,
        enums,
    }), [projectId, projectName, projectDescription, dialect, theme, autoAddId, autoAddTimestamps, tables, relations, enums]);

    const rawCode = useMemo(() => {
        try {
            if (codeType === "sql") {
                const generator = getGeneratorForDialect(dialect);
                return generator.generate(currentAST);
            }
            else {
                const generator = createTypescriptGenerator();
                return generator.generate(currentAST);
            }
        }
        catch (err: unknown) {
            return `-- Code Generation Error: ${err instanceof Error ? err.message : String(err)}`;
        }
    }, [currentAST, dialect, codeType]);

    useEffect(() => {
        if (codeType !== "sql" || !rawCode || rawCode.startsWith("-- Code Generation Error")) {
            setFormattedCode(rawCode);
            return;
        }

        let isMounted = true;
        setFormattedCode(rawCode);

        import("sql-formatter").then(({ format }) => {
            if (!isMounted) return;
            try {
                const result = format(rawCode, {
                    language: dialect === "postgres" ? "postgresql" : dialect === "mysql" ? "mysql" : "sqlite",
                    keywordCase: "upper",
                });
                setFormattedCode(result);
            } catch {
                setFormattedCode(rawCode);
            }
        }).catch(() => {
            if (isMounted) {
                setFormattedCode(rawCode);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [rawCode, codeType, dialect]);

    const handleCopy = (): void => {
        navigator.clipboard.writeText(formattedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                    <button
                        type="button"
                        onClick={() => setCodeType("sql")}
                        className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                            codeType === "sql" ? "bg-background text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        SQL ({dialect.toUpperCase()})
                    </button>
                    <button
                        type="button"
                        onClick={() => setCodeType("typescript")}
                        className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                            codeType === "typescript" ? "bg-background text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        TypeScript
                    </button>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 text-xs gap-1.5 cursor-pointer"
                >
                    {copied ? (
                        <>
                            <Check className="size-3.5 text-emerald-500" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="size-3.5" />
                            Copy Code
                        </>
                    )}
                </Button>
            </div>

            <div className="flex-1 min-h-87.5 border rounded-md overflow-hidden bg-background">
                <Editor
                    height="100%"
                    language={codeType === "sql" ? "sql" : "typescript"}
                    value={formattedCode}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 12,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: "on",
                    }}
                />
            </div>
        </div>
    );
};
