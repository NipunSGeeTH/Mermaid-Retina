import type { AlertColor } from "@mui/material";
import type { MermaidTheme } from "@/lib/mermaidThemes";

export type ToastState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

export type AppMode = "dark" | "light";
export type AppThemeName = "classic" | "ocean" | "forest" | "sunset";
export type GraphBackgroundStyle =
  | "transparent"
  | "solid"
  | "soft-grid"
  | "dots"
  | "gradient"
  | "custom"
  | "image";

export type PersistedState = {
  code: string;
  theme: MermaidTheme;
  appMode: AppMode;
  appTheme: AppThemeName;
  graphBackgroundStyle: GraphBackgroundStyle;
  graphBackgroundColor: string;
  graphBackgroundImage?: string;
  graphBackgroundImageWidth?: number;
  graphBackgroundImageHeight?: number;
  scale: number;
  splitRatio: number;
  drafts?: DraftItem[];
  activeDraftId?: string;
  snapshots?: SnapshotItem[];
  accessibilityMode?: AccessibilityMode;
};

export type DraftItem = {
  id: string;
  name: string;
  code: string;
  updatedAt: number;
};

export type MobilePanelMode = "split" | "editor" | "preview";
export type AccessibilityMode = "standard" | "enhanced" | "high-contrast";

export type ExportType = "png" | "jpg" | "pdf" | "svg" | "mmd";

export type SnapshotItem = {
  id: string;
  code: string;
  createdAt: number;
  reason: "auto" | "manual";
};

export type RenderSource = "cache-memory" | "cache-storage" | "worker" | "main-thread" | "none";

export type RenderDiagnostics = {
  source: RenderSource;
  durationMs: number | null;
  cacheHit: boolean;
  cacheEntries: number;
  timedOut: boolean;
  lastError: string;
  lastRenderedAt: string;
};
