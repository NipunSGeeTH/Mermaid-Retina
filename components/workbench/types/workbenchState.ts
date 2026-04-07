import type { AlertColor } from "@mui/material";
import type { MermaidTheme } from "@/lib/mermaidThemes";

export type ToastState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

export type PersistedState = {
  code: string;
  theme: MermaidTheme;
  scale: number;
  templateId: string;
  splitRatio: number;
};

export type MobilePanelMode = "split" | "editor" | "preview";

