"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import type { MermaidTheme } from "@/lib/mermaidThemes";

type MermaidPreviewState = {
  svg: string;
  error: string;
  isRendering: boolean;
  lastRenderedAt: string;
};

export function useMermaidPreview(code: string, theme: MermaidTheme): MermaidPreviewState {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [lastRenderedAt, setLastRenderedAt] = useState<string>("");
  const renderTokenRef = useRef<number>(0);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      flowchart: { htmlLabels: false },
      mindmap: { padding: 12 },
      sequence: { useMaxWidth: true },
    });
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        const trimmed = code.trim();
        if (!trimmed) {
          setSvg("");
          setError("");
          setIsRendering(false);
          return;
        }

        const token = ++renderTokenRef.current;
        setIsRendering(true);

        try {
          const id = `mermaid-${token}`;
          const { svg: rendered } = await mermaid.render(id, trimmed);
          if (token !== renderTokenRef.current) {
            return;
          }
          setSvg(rendered);
          setError("");
          setLastRenderedAt(new Date().toLocaleTimeString());
        } catch (renderError: unknown) {
          if (token === renderTokenRef.current) {
            setSvg("");
            setError(
              renderError instanceof Error
                ? renderError.message
                : "Unknown Mermaid render error"
            );
          }
        } finally {
          if (token === renderTokenRef.current) {
            setIsRendering(false);
          }
        }
      })();
    }, 250);

    return () => clearTimeout(timer);
  }, [code, theme]);

  return { svg, error, isRendering, lastRenderedAt };
}
