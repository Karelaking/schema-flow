/**
 * Captures the ReactFlow canvas element and downloads it as a PNG image.
 * @param fileName File name for the downloaded PNG image.
 */
export const exportCanvasToPng = async (fileName: string = "schema-diagram.png"): Promise<void> => {
    const flowElement = document.querySelector<HTMLElement>(".react-flow");
    if (!flowElement) {
        throw new Error("ReactFlow canvas element not found");
    }

    const { toPng } = await import("html-to-image");

    const dataUrl = await toPng(flowElement, {
        backgroundColor: "#0f172a",
        filter: node => {
            if (node.classList && node.classList.contains("react-flow__controls")) {
                return false;
            }
            return true;
        },
    });

    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = dataUrl;
    downloadAnchor.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
};
