import type { MermaidTheme } from "@/lib/mermaidThemes";
import type {
  AppMode,
  AppThemeName,
  DraftItem,
  GraphBackgroundStyle,
} from "@/components/workbench/types/workbenchState";

export type PersistParams = {
  code: string;
  drafts: DraftItem[];
  activeDraftId: string;
  theme: MermaidTheme;
  appMode: AppMode;
  appTheme: AppThemeName;
  graphBackgroundStyle: GraphBackgroundStyle;
  graphBackgroundColor: string;
  scale: number;
  splitRatio: number;
  isReady: boolean;
  setCode: (value: string) => void;
  setDrafts: (value: DraftItem[]) => void;
  setActiveDraftId: (value: string) => void;
  setTheme: (value: MermaidTheme) => void;
  setAppMode: (value: AppMode) => void;
  setAppTheme: (value: AppThemeName) => void;
  setGraphBackgroundStyle: (value: GraphBackgroundStyle) => void;
  setGraphBackgroundColor: (value: string) => void;
  setScale: (value: number) => void;
  setSplitRatio: (value: number) => void;
  setIsReady: (value: boolean) => void;
};
