import type { AlertColor } from "@mui/material";
import type { MermaidTheme } from "@/lib/mermaidThemes";

export type ToastState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

export type AppMode = "dark" | "light";
export type AppThemeName = "classic" | "ocean" | "forest" | "sunset";

export type PersistedState = {
  code: string;
  theme: MermaidTheme;
  appMode: AppMode;
  appTheme: AppThemeName;
  scale: number;
  splitRatio: number;
};

export type MobilePanelMode = "split" | "editor" | "preview";

export type ExportType = "png" | "svg" | "mmd";
