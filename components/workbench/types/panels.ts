import type { PointerEvent, RefObject } from "react";
import type { GraphBackgroundStyle } from "./workbenchState";

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
  graphBackgroundStyle: GraphBackgroundStyle;
  graphBackgroundImageWidth: number;
  graphBackgroundImageHeight: number;
  splitContainerRef: RefObject<HTMLDivElement | null>;
  onCodeChange: (nextCode: string) => void;
  onStartSplitDrag: (event: PointerEvent<HTMLDivElement>) => void;
};
