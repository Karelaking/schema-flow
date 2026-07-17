import { ReactFlowProvider } from "@xyflow/react";
import { CanvasInner } from "./InnerCanvas";
import { JSX } from "react/jsx-runtime";

export function Canvas(): JSX.Element {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

export default Canvas;
