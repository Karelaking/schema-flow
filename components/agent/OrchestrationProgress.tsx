"use client";

import React from "react";
import { Brain, Search, Cpu, Wrench, CheckCircle2, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import type { OrchestratorPhase } from "@/lib/ai/orchestrator";
import type { SchemaAuditReport } from "@/lib/ai/evaluator";

/**
 * Props for OrchestrationProgress component.
 */
export interface OrchestrationProgressProps {
    phase?: OrchestratorPhase | null;
    auditReport?: SchemaAuditReport | null;
    isGoalMode: boolean;
}

/**
 * Renders real-time autonomous loop phase progress and evaluation quality score badges.
 */
export const OrchestrationProgress: React.FC<OrchestrationProgressProps> = ({
    phase,
    auditReport,
    isGoalMode,
}): React.ReactElement | null => {
    if (!phase && !auditReport) {
        return null;
    }

    const getPhaseIcon = (step?: OrchestratorPhase["step"]): React.ReactNode => {
        switch (step) {
            case "memory":
                return <Brain className="size-3.5 text-violet-500 animate-pulse" />;
            case "rag":
                return <Search className="size-3.5 text-blue-500 animate-pulse" />;
            case "thinking":
                return <Cpu className="size-3.5 text-indigo-500 animate-pulse" />;
            case "executing":
                return <Wrench className="size-3.5 text-amber-500 animate-pulse" />;
            case "evaluating":
                return <RefreshCw className="size-3.5 text-emerald-500 animate-spin" />;
            case "fixing":
                return <AlertTriangle className="size-3.5 text-red-500 animate-bounce" />;
            case "complete":
                return <CheckCircle2 className="size-3.5 text-emerald-500" />;
            default:
                return <Sparkles className="size-3.5 text-primary" />;
        }
    };

    return (
        <div className="mx-3 my-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5 flex flex-col gap-2">
            {phase && (
                <div className="flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-background border flex items-center justify-center shrink-0 shadow-xs">
                        {getPhaseIcon(phase.step)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold tracking-wide uppercase text-primary">
                                {isGoalMode ? "Autonomous Goal Loop" : "Agent Orchestration"}
                            </span>
                            {phase.iteration > 1 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 font-semibold">
                                    Pass {phase.iteration}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{phase.message}</p>
                    </div>
                </div>
            )}

            {auditReport && (
                <div className="pt-1.5 border-t border-primary/10 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">Schema Quality Score:</span>
                        <span
                            className={`px-1.5 py-0.5 rounded-full font-bold ${
                                auditReport.score >= 80
                                    ? "bg-emerald-500/15 text-emerald-600"
                                    : auditReport.score >= 50
                                        ? "bg-amber-500/15 text-amber-600"
                                        : "bg-red-500/15 text-red-600"
                            }`}
                        >
                            {auditReport.score}/100
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {auditReport.errorCount > 0 && (
                            <span className="text-red-500 font-medium">
                                {auditReport.errorCount} error(s)
                            </span>
                        )}
                        {auditReport.warningCount > 0 && (
                            <span className="text-amber-600 font-medium">
                                {auditReport.warningCount} warn(s)
                            </span>
                        )}
                        {auditReport.passed && (
                            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                <CheckCircle2 className="size-3" />
                                Verified
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
