"use client";

import { useEffect } from "react";
import { DIAGRAM_TEMPLATES } from "@/lib/diagramTemplates";
import { MERMAID_THEMES, type MermaidTheme } from "@/lib/mermaidThemes";
import { DEFAULT_SECTION_COLORS, SCALES, STORAGE_KEY } from "@/components/workbench/constants";
import type { PersistParams, PersistedState } from "@/components/workbench/types";

export function useWorkbenchPersistence(params: PersistParams) {
  const {
    code,
    theme,
    scale,
    splitRatio,
    sectionColors,
    isReady,
    setCode,
    setTheme,
    setScale,
    setSplitRatio,
    setSectionColors,
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
        if (typeof parsed.scale === "number" && SCALES.includes(parsed.scale as 1 | 2 | 4)) {
          setScale(parsed.scale);
        }
        if (
          typeof parsed.theme === "string" &&
          MERMAID_THEMES.includes(parsed.theme as MermaidTheme)
        ) {
          setTheme(parsed.theme as MermaidTheme);
        }
        if (typeof parsed.splitRatio === "number") {
          setSplitRatio(parsed.splitRatio);
        }
        if (parsed.sectionColors && typeof parsed.sectionColors === "object") {
          setSectionColors({
            pageBackground:
              typeof parsed.sectionColors.pageBackground === "string"
                ? parsed.sectionColors.pageBackground
                : DEFAULT_SECTION_COLORS.pageBackground,
            editorBackground:
              typeof parsed.sectionColors.editorBackground === "string"
                ? parsed.sectionColors.editorBackground
                : DEFAULT_SECTION_COLORS.editorBackground,
            editorText:
              typeof parsed.sectionColors.editorText === "string"
                ? parsed.sectionColors.editorText
                : DEFAULT_SECTION_COLORS.editorText,
            previewBackground:
              typeof parsed.sectionColors.previewBackground === "string"
                ? parsed.sectionColors.previewBackground
                : DEFAULT_SECTION_COLORS.previewBackground,
          });
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
    const payload: PersistedState = { code, theme, scale, splitRatio, sectionColors };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [code, isReady, scale, sectionColors, splitRatio, theme]);
}
