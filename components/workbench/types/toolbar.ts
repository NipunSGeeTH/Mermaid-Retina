import type { MobilePanelMode } from "@/components/workbench/types/workbenchState";

export type WorkbenchToolbarProps = {
  isDesktop: boolean;
  mobilePanelMode: MobilePanelMode;
  canExport: boolean;
  onShareLink: () => void;
  onOpenGraph: () => void;
  onOpenExport: () => void;
  onOpenTheme: () => void;
  onImportClick: () => void;
  onMobilePanelModeChange: (mode: MobilePanelMode) => void;
};
