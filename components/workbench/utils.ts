function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = async () => {
      try {
        if (typeof image.decode === "function") {
          await image.decode();
        }
      } catch {
        // Some browsers can throw on decode() for SVG even after load; onload is enough.
      }
      resolve(image);
    };
    image.onerror = () => reject(new Error("Failed to load SVG image"));
    image.src = src;
  });
}

function revokeObjectUrlDeferred(url: string): void {
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
}

function normalizeSvgXml(svg: string): string {
  return svg
    .replace(/<br(\s*)>/gi, "<br$1/>")
    .replace(/<hr(\s*)>/gi, "<hr$1/>")
    .replace(/<img([^>]*?)(?<!\/)>/gi, "<img$1/>");
}

function isSafeSvgRef(value: string | null): boolean {
  if (!value) return false;
  const ref = value.trim();
  return ref.startsWith("#") || ref.startsWith("data:") || ref.startsWith("blob:");
}

function ensureStandaloneSvg(svg: string): string {
  const normalized = normalizeSvgXml(svg);
  const parser = new DOMParser();
  const doc = parser.parseFromString(normalized, "image/svg+xml");
  if (doc.querySelector("parsererror")) {
    return normalized;
  }

  const svgEl = doc.documentElement;
  if (svgEl.nodeName.toLowerCase() !== "svg") {
    return normalized;
  }

  if (!svgEl.getAttribute("xmlns")) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  if (!svgEl.getAttribute("xmlns:xlink")) {
    svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  }

  // Remove external linked assets that can break canvas rasterization.
  const linkedAssets = Array.from(svgEl.querySelectorAll("image,use"));
  for (const el of linkedAssets) {
    const href = el.getAttribute("href");
    const xlinkHref = el.getAttribute("xlink:href");
    const ref = href || xlinkHref;
    if (ref && !isSafeSvgRef(ref)) {
      el.remove();
    }
  }

  const viewBox = svgEl.getAttribute("viewBox");
  const widthAttr = svgEl.getAttribute("width");
  const heightAttr = svgEl.getAttribute("height");
  const width = Number.parseFloat(widthAttr || "");
  const height = Number.parseFloat(heightAttr || "");

  if (!viewBox && Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    svgEl.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }
  if (!widthAttr && viewBox) {
    const parts = viewBox.split(/\s+/).map(Number.parseFloat);
    if (parts.length === 4 && Number.isFinite(parts[2]) && parts[2] > 0) {
      svgEl.setAttribute("width", String(parts[2]));
    }
  }
  if (!heightAttr && viewBox) {
    const parts = viewBox.split(/\s+/).map(Number.parseFloat);
    if (parts.length === 4 && Number.isFinite(parts[3]) && parts[3] > 0) {
      svgEl.setAttribute("height", String(parts[3]));
    }
  }

  return new XMLSerializer().serializeToString(svgEl);
}

function makeSvgBlob(svg: string): Blob {
  return new Blob([ensureStandaloneSvg(svg.trim())], {
    type: "image/svg+xml;charset=utf-8",
  });
}

async function getSvgImageElement(svg: string): Promise<HTMLImageElement> {
  const trimmed = ensureStandaloneSvg(svg.trim());
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`;
  try {
    return await loadImageFromSrc(dataUrl);
  } catch {
    const blobUrl = URL.createObjectURL(makeSvgBlob(trimmed));
    const image = await loadImageFromSrc(blobUrl);
    revokeObjectUrlDeferred(blobUrl);
    return image;
  }
}

export async function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  let lastError: unknown;
  try {
    return await getSvgImageElement(svg);
  } catch (error) {
    lastError = error;
  }

  try {
    if (typeof createImageBitmap === "function") {
      const blob = makeSvgBlob(svg);
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context unavailable for bitmap fallback");
      }
      ctx.drawImage(bitmap, 0, 0);
      const blobFromCanvas = await canvasToBlob(canvas, "image/png");
      const pngUrl = URL.createObjectURL(blobFromCanvas);
      const pngImage = await loadImageFromSrc(pngUrl);
      revokeObjectUrlDeferred(pngUrl);
      if (typeof bitmap.close === "function") {
        bitmap.close();
      }
      return pngImage;
    }
  } catch (error) {
    lastError = error;
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("Failed to load SVG image");
}

export async function getSvgDimensions(
  svg: string
): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(makeSvgBlob(svg));
      const width = bitmap.width;
      const height = bitmap.height;
      if (typeof bitmap.close === "function") {
        bitmap.close();
      }
      if (width > 0 && height > 0) {
        return { width, height };
      }
    } catch {
      // Fallback to Image path.
    }
  }

  const image = await getSvgImageElement(svg);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (width <= 0 || height <= 0) {
    throw new Error("Rendered SVG has invalid dimensions");
  }
  return { width, height };
}

export async function drawSvgOnCanvas(
  ctx: CanvasRenderingContext2D,
  svg: string,
  targetWidth: number,
  targetHeight: number
): Promise<void> {
  if (targetWidth <= 0 || targetHeight <= 0) {
    throw new Error("Invalid canvas target size");
  }
  const image = await getSvgImageElement(svg);
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
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
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob"));
          return;
        }
        resolve(blob);
      }, type, quality);
    } catch (error) {
      reject(error instanceof Error ? error : new Error("Failed to create image blob"));
    }
  });
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  revokeObjectUrlDeferred(url);
}

export function clampSplitRatio(value: number): number {
  return Math.min(75, Math.max(25, value));
}

export function makeSvgExportCompatible(svg: string): string {
  const normalized = normalizeSvgXml(svg);
  const parser = new DOMParser();
  const doc = parser.parseFromString(normalized, "image/svg+xml");
  if (doc.querySelector("parsererror")) {
    return normalized;
  }
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
