"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { clampSplitRatio } from "@/components/workbench/utils";

type SplitLayoutState = {
  isDesktop: boolean;
  splitRatio: number;
  isDraggingSplit: boolean;
  splitContainerRef: React.RefObject<HTMLDivElement | null>;
  startSplitDrag: (event: PointerEvent<HTMLDivElement>) => void;
  setSplitRatio: (next: number) => void;
};

export function useSplitLayout(initialRatio = 50): SplitLayoutState {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [splitRatio, setSplitRatioState] = useState<number>(initialRatio);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    // Treat tablets (including iPad Mini portrait) as "desktop layout"
    // so users get side-by-side editor/preview with draggable divider.
    const updateViewport = () => setIsDesktop(window.innerWidth >= 740);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (!isDesktop || !isDraggingSplit) {
      return;
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const container = splitContainerRef.current;
      if (!container) {
        return;
      }
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) {
        return;
      }
      const nextRatio = ((event.clientX - rect.left) / rect.width) * 100;
      setSplitRatioState(clampSplitRatio(nextRatio));
    };

    const stopDragging = () => setIsDraggingSplit(false);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [isDesktop, isDraggingSplit]);

  const startSplitDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDesktop) {
      return;
    }
    event.preventDefault();
    setIsDraggingSplit(true);
  };

  const setSplitRatio = (next: number) => {
    setSplitRatioState(clampSplitRatio(next));
  };

  return {
    isDesktop,
    splitRatio,
    isDraggingSplit,
    splitContainerRef,
    startSplitDrag,
    setSplitRatio,
  };
}
