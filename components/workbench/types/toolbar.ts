import type { MobilePanelMode } from "@/components/workbench/types/workbenchState";
import type { DraftItem } from "@/components/workbench/types/workbenchState";

export type WorkbenchToolbarProps = {
  isDesktop: boolean;
  mobilePanelMode: MobilePanelMode;
  canExport: boolean;
  drafts: DraftItem[];
  activeDraftId: string;
  onSelectDraft: (draftId: string) => void;
  onCreateDraft: () => void;
  onDeleteDraft: (draftId: string) => void;
  onShareLink: () => void;
  onOpenGraph: () => void;
  onOpenExport: () => void;
  onOpenTheme: () => void;
  onImportClick: () => void;
  onMobilePanelModeChange: (mode: MobilePanelMode) => void;
};
