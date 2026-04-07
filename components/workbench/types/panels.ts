import type { PointerEvent, RefObject } from "react";
import type { SectionColors } from "@/components/workbench/types/workbenchState";

export type WorkbenchPanelsProps = {
  isDesktop: boolean;
  splitRatio: number;
  isDraggingSplit: boolean;
  showEditorPanel: boolean;
  showPreviewPanel: boolean;
  code: string;
  error: string;
  svg: string;
  sectionColors: SectionColors;
  splitContainerRef: RefObject<HTMLDivElement | null>;
  onCodeChange: (nextCode: string) => void;
  onStartSplitDrag: (event: PointerEvent<HTMLDivElement>) => void;
};
