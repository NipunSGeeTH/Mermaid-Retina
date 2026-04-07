import type { AlertColor } from "@mui/material";
import type { MermaidTheme } from "@/lib/mermaidThemes";

export type ToastState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

export type SectionColors = {
  pageBackground: string;
  editorBackground: string;
  editorText: string;
  previewBackground: string;
};

export type PersistedState = {
  code: string;
  theme: MermaidTheme;
  scale: number;
  splitRatio: number;
  sectionColors: SectionColors;
};

export type MobilePanelMode = "split" | "editor" | "preview";

export type ExportType = "png" | "svg" | "mmd";
