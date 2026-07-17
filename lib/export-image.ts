import { toPng } from "html-to-image";

/**
 * Captures the ReactFlow canvas element and downloads it as a PNG image.
 * @param fileName File name for the downloaded PNG image.
 */
export async function exportCanvasToPng(fileName: string = "schema-diagram.png"): Promise<void> {
  const flowElement = document.querySelector<HTMLElement>(".react-flow");
  if (!flowElement) {
    throw new Error("ReactFlow canvas element not found");
  }

  const dataUrl = await toPng(flowElement, {
    backgroundColor: "#0f172a",
    filter: (node) => {
      // Exclude controls & minimap overlay controls if desired
      if (node.classList && node.classList.contains("react-flow__controls")) {
        return false;
      }
      return true;
    },
  });

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
