import type { MermaidTheme } from "@/lib/mermaidThemes";

export type PersistParams = {
  code: string;
  theme: MermaidTheme;
  scale: number;
  templateId: string;
  splitRatio: number;
  isReady: boolean;
  setCode: (value: string) => void;
  setTheme: (value: MermaidTheme) => void;
  setScale: (value: number) => void;
  setTemplateId: (value: string) => void;
  setSplitRatio: (value: number) => void;
  setIsReady: (value: boolean) => void;
};

