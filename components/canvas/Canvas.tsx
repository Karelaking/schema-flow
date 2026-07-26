import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { CanvasInner } from "./InnerCanvas";

/**
 * Main React Flow canvas wrapper component with provider context.
 */
export const Canvas: React.FC = (): React.ReactElement => {
    return (
        <ReactFlowProvider>
            <CanvasInner />
        </ReactFlowProvider>
    );
};

export default Canvas;
