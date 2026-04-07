import type { MermaidTheme } from "@/lib/mermaidThemes";
import type { SectionColors } from "@/components/workbench/types/workbenchState";

export type PersistParams = {
  code: string;
  theme: MermaidTheme;
  scale: number;
  splitRatio: number;
  sectionColors: SectionColors;
  isReady: boolean;
  setCode: (value: string) => void;
  setTheme: (value: MermaidTheme) => void;
  setScale: (value: number) => void;
  setSplitRatio: (value: number) => void;
  setSectionColors: (value: SectionColors) => void;
  setIsReady: (value: boolean) => void;
};
