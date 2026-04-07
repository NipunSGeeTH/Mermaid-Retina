"use client";

import { useEffect } from "react";
import { DIAGRAM_TEMPLATES } from "@/lib/diagramTemplates";
import { MERMAID_THEMES, type MermaidTheme } from "@/lib/mermaidThemes";
import { SCALES, STORAGE_KEY } from "@/components/workbench/constants";
import type { PersistParams, PersistedState } from "@/components/workbench/types";

export function useWorkbenchPersistence(params: PersistParams) {
  const {
    code,
    theme,
    scale,
    templateId,
    splitRatio,
    isReady,
    setCode,
    setTheme,
    setScale,
    setTemplateId,
    setSplitRatio,
    setIsReady,
  } = params;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        if (typeof parsed.code === "string" && parsed.code.trim()) {
          setCode(parsed.code);
        } else {
          setCode(DIAGRAM_TEMPLATES[0].code);
        }
        if (typeof parsed.templateId === "string") {
          setTemplateId(parsed.templateId);
        }
        if (
          typeof parsed.theme === "string" &&
          MERMAID_THEMES.includes(parsed.theme as MermaidTheme)
        ) {
          setTheme(parsed.theme as MermaidTheme);
        }
        if (typeof parsed.scale === "number" && SCALES.includes(parsed.scale as 1 | 2 | 4)) {
          setScale(parsed.scale);
        }
        if (typeof parsed.splitRatio === "number") {
          setSplitRatio(parsed.splitRatio);
        }
      }
    } catch {
      // Ignore invalid local storage payload
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      return;
    }
    const payload: PersistedState = { code, theme, scale, templateId, splitRatio };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [code, isReady, scale, splitRatio, templateId, theme]);
}
