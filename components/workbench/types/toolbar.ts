import type { SelectChangeEvent } from "@mui/material";
import type { MermaidTheme } from "@/lib/mermaidThemes";
import type { MobilePanelMode } from "@/components/workbench/types/workbenchState";

export type WorkbenchToolbarProps = {
  error: string;
  isRendering: boolean;
  lineCount: number;
  charCount: number;
  lastRenderedAt: string;
  templateId: string;
  theme: MermaidTheme;
  scale: number;
  scales: readonly number[];
  exportDisabled: boolean;
  isDesktop: boolean;
  mobilePanelMode: MobilePanelMode;
  onTemplateChange: (event: SelectChangeEvent<string>) => void;
  onThemeChange: (event: SelectChangeEvent<string>) => void;
  onScaleChange: (event: SelectChangeEvent<number>) => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onDownloadSource: () => void;
  onImportClick: () => void;
  onMobilePanelModeChange: (mode: MobilePanelMode) => void;
};

