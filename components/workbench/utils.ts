export function loadSvgImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load SVG image"));
    image.src = url;
  });
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return canvasToBlob(canvas, "image/png");
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create image blob"));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function clampSplitRatio(value: number): number {
  return Math.min(75, Math.max(25, value));
}

export function makeSvgExportCompatible(svg: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const svgEl = doc.documentElement;
  const ns = "http://www.w3.org/2000/svg";

  const foreignObjects = Array.from(svgEl.querySelectorAll("foreignObject"));
  for (const foreignObject of foreignObjects) {
    const label = (foreignObject.textContent || "").trim();
    if (!label) {
      foreignObject.remove();
      continue;
    }

    const x = Number.parseFloat(foreignObject.getAttribute("x") || "0");
    const y = Number.parseFloat(foreignObject.getAttribute("y") || "0");
    const width = Number.parseFloat(foreignObject.getAttribute("width") || "0");
    const height = Number.parseFloat(foreignObject.getAttribute("height") || "0");

    const text = doc.createElementNS(ns, "text");
    text.setAttribute("x", String(x + width / 2));
    text.setAttribute("y", String(y + height / 2));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "14");
    text.setAttribute("font-family", "Arial, sans-serif");
    text.setAttribute("fill", "#1f2937");

    const lines = label.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    if (lines.length <= 1) {
      text.textContent = lines[0] || label;
    } else {
      const start = -((lines.length - 1) * 0.6) / 2;
      lines.forEach((line, index) => {
        const tspan = doc.createElementNS(ns, "tspan");
        tspan.setAttribute("x", String(x + width / 2));
        tspan.setAttribute("dy", index === 0 ? `${start}em` : "1.2em");
        tspan.textContent = line;
        text.appendChild(tspan);
      });
    }

    foreignObject.parentNode?.insertBefore(text, foreignObject);
    foreignObject.remove();
  }

  return new XMLSerializer().serializeToString(svgEl);
}
