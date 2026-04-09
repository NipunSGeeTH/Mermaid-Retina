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

type CachedRender = {
  svg: string;
  renderedAt: string;
};

const MAX_CACHE_ENTRIES = 30;

export function useMermaidPreview(code: string, theme: MermaidTheme): MermaidPreviewState {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [lastRenderedAt, setLastRenderedAt] = useState<string>("");
  const renderTokenRef = useRef<number>(0);
  const renderCacheRef = useRef<Map<string, CachedRender>>(new Map());

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
    const trimmed = code.trim();
    if (!trimmed) {
      setSvg("");
      setError("");
      setIsRendering(false);
      return;
    }

    const token = ++renderTokenRef.current;
    const cacheKey = `${theme}::${trimmed}`;
    const cached = renderCacheRef.current.get(cacheKey);
    if (cached) {
      setSvg(cached.svg);
      setError("");
      setIsRendering(false);
      setLastRenderedAt(cached.renderedAt);
      return;
    }

    setIsRendering(true);

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const id = `mermaid-${token}`;
          const { svg: rendered } = await mermaid.render(id, trimmed);
          if (token !== renderTokenRef.current) {
            return;
          }

          const renderedAt = new Date().toLocaleTimeString();
          renderCacheRef.current.set(cacheKey, { svg: rendered, renderedAt });
          if (renderCacheRef.current.size > MAX_CACHE_ENTRIES) {
            const oldestKey = renderCacheRef.current.keys().next().value;
            if (oldestKey) {
              renderCacheRef.current.delete(oldestKey);
            }
          }

          setSvg(rendered);
          setError("");
          setLastRenderedAt(renderedAt);
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
