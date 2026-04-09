import type { PointerEvent, RefObject } from "react";
import type { GraphBackgroundStyle, RenderDiagnostics } from "./workbenchState";

export type WorkbenchPanelsProps = {
  isDesktop: boolean;
  splitRatio: number;
  isDraggingSplit: boolean;
  showEditorPanel: boolean;
  showPreviewPanel: boolean;
  code: string;
  error: string;
  svg: string;
  isRendering: boolean;
  renderTimedOut: boolean;
  diagnostics: RenderDiagnostics;
  previewBackground: string;
  graphBackgroundStyle: GraphBackgroundStyle;
  graphBackgroundImageWidth: number;
  graphBackgroundImageHeight: number;
  splitContainerRef: RefObject<HTMLDivElement | null>;
  onCodeChange: (nextCode: string) => void;
  onRetryRender: () => void;
  onStartSplitDrag: (event: PointerEvent<HTMLDivElement>) => void;
};
