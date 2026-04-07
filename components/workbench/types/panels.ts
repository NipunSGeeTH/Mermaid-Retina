import type { PointerEvent, RefObject } from "react";

export type WorkbenchPanelsProps = {
  isDesktop: boolean;
  splitRatio: number;
  isDraggingSplit: boolean;
  showEditorPanel: boolean;
  showPreviewPanel: boolean;
  code: string;
  error: string;
  svg: string;
  previewBackground: string;
  splitContainerRef: RefObject<HTMLDivElement | null>;
  onCodeChange: (nextCode: string) => void;
  onStartSplitDrag: (event: PointerEvent<HTMLDivElement>) => void;
};
