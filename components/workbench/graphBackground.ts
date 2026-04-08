import type { AppMode, GraphBackgroundStyle } from "@/components/workbench/types";

export const GRAPH_BACKGROUND_OPTIONS: Array<{
  value: GraphBackgroundStyle;
  label: string;
}> = [
  { value: "transparent", label: "Transparent" },
  { value: "solid", label: "Solid Color" },
  { value: "soft-grid", label: "Soft Grid" },
  { value: "dots", label: "Dots" },
  { value: "gradient", label: "Gradient" },
  { value: "custom", label: "Custom Color" },
  { value: "image", label: "Image Upload" },
];

export function getPreviewBackgroundCss(
  style: GraphBackgroundStyle,
  customColor: string,
  appMode: AppMode,
  imageData?: string,
  imageWidth?: number,
  imageHeight?: number
): string {
  const base = appMode === "dark" ? "#0f172a" : "#f8fafc";
  const gridLine = appMode === "dark" ? "rgba(148,163,184,0.2)" : "rgba(100,116,139,0.15)";
  const dots = appMode === "dark" ? "rgba(148,163,184,0.22)" : "rgba(100,116,139,0.2)";

  if (style === "transparent") return "transparent";
  if (style === "image" && imageData) return `url('${imageData}')`;
  if (style === "solid" || style === "custom") return customColor;
  if (style === "gradient") {
    return appMode === "dark"
      ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
      : "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)";
  }
  if (style === "dots") {
    return `radial-gradient(${dots} 1.2px, transparent 1.2px), ${base}`;
  }
  return `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px), ${base}`;
}

export function applyCanvasBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: GraphBackgroundStyle,
  customColor: string,
  appMode: AppMode,
  imageData?: string,
  imageWidth?: number,
  imageHeight?: number
): Promise<void> {
  return new Promise((resolve) => {
    if (style === "transparent") {
      resolve();
      return;
    }

    if (style === "image" && imageData) {
      const img = new Image();
      img.onload = () => {
        const finalWidth = imageWidth || width;
        const finalHeight = imageHeight || height;
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        resolve();
      };
      img.onerror = () => {
        resolve(); // Resolve even if image fails to load
      };
      img.src = imageData;
      return;
    }

    if (style === "solid" || style === "custom") {
      ctx.fillStyle = customColor;
      ctx.fillRect(0, 0, width, height);
      resolve();
      return;
    }

    if (style === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      if (appMode === "dark") {
        gradient.addColorStop(0, "#1e293b");
        gradient.addColorStop(1, "#0f172a");
      } else {
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(1, "#e2e8f0");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      resolve();
      return;
    }

    const base = appMode === "dark" ? "#0f172a" : "#f8fafc";
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    if (style === "dots") {
      const dot = appMode === "dark" ? "rgba(148,163,184,0.22)" : "rgba(100,116,139,0.2)";
      ctx.fillStyle = dot;
      for (let y = 12; y < height; y += 16) {
        for (let x = 12; x < width; x += 16) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      resolve();
      return;
    }

    const gridLine = appMode === "dark" ? "rgba(148,163,184,0.2)" : "rgba(100,116,139,0.15)";
    ctx.strokeStyle = gridLine;
    ctx.lineWidth = 1;
    for (let y = 0; y <= height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    resolve();
  });
}

