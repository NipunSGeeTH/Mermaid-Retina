import type { MermaidTheme } from "@/lib/mermaidThemes";
import type { AppMode, AppThemeName } from "@/components/workbench/types/workbenchState";

export type PersistParams = {
  code: string;
  theme: MermaidTheme;
  appMode: AppMode;
  appTheme: AppThemeName;
  scale: number;
  splitRatio: number;
  isReady: boolean;
  setCode: (value: string) => void;
  setTheme: (value: MermaidTheme) => void;
  setAppMode: (value: AppMode) => void;
  setAppTheme: (value: AppThemeName) => void;
  setScale: (value: number) => void;
  setSplitRatio: (value: number) => void;
  setIsReady: (value: boolean) => void;
};
