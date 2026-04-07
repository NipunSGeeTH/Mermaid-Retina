"use client";

import { useEffect } from "react";
import { DIAGRAM_TEMPLATES } from "@/lib/diagramTemplates";
import { MERMAID_THEMES, type MermaidTheme } from "@/lib/mermaidThemes";
import {
  DEFAULT_GRAPH_BACKGROUND_COLOR,
  DEFAULT_GRAPH_BACKGROUND_STYLE,
  SCALES,
  STORAGE_KEY,
} from "@/components/workbench/constants";
import { parseSharedCodeFromHash } from "@/components/workbench/shareUrl";
import type { DraftItem, PersistParams, PersistedState } from "@/components/workbench/types";

function isValidDraft(value: unknown): value is DraftItem {
  if (!value || typeof value !== "object") {
    return false;
  }
  const draft = value as Partial<DraftItem>;
  return (
    typeof draft.id === "string" &&
    draft.id.length > 0 &&
    typeof draft.name === "string" &&
    draft.name.length > 0 &&
    typeof draft.code === "string" &&
    typeof draft.updatedAt === "number"
  );
}

export function useWorkbenchPersistence(params: PersistParams) {
  const {
    code,
    drafts,
    activeDraftId,
    theme,
    appMode,
    appTheme,
    graphBackgroundStyle,
    graphBackgroundColor,
    scale,
    splitRatio,
    isReady,
    setCode,
    setDrafts,
    setActiveDraftId,
    setTheme,
    setAppMode,
    setAppTheme,
    setGraphBackgroundStyle,
    setGraphBackgroundColor,
    setScale,
    setSplitRatio,
    setIsReady,
  } = params;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const sharedHashState = parseSharedCodeFromHash(window.location.hash);
      const hasSharedCodeInUrl = sharedHashState.hasShareCode && sharedHashState.code !== null;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;

        const validDrafts = Array.isArray(parsed.drafts)
          ? parsed.drafts.filter((item): item is DraftItem => isValidDraft(item))
          : [];

        if (validDrafts.length > 0) {
          setDrafts(validDrafts);
          const restoredActiveDraftId =
            typeof parsed.activeDraftId === "string" &&
            validDrafts.some((item) => item.id === parsed.activeDraftId)
              ? parsed.activeDraftId
              : validDrafts[0].id;
          setActiveDraftId(restoredActiveDraftId);

          if (!hasSharedCodeInUrl) {
            const activeDraft = validDrafts.find((item) => item.id === restoredActiveDraftId);
            setCode(activeDraft?.code ?? validDrafts[0].code);
          }
        } else if (!hasSharedCodeInUrl) {
          if (typeof parsed.code === "string" && parsed.code.trim()) {
            setCode(parsed.code);
          } else {
            setCode(DIAGRAM_TEMPLATES[0].code);
          }
        }

        if (
          typeof parsed.scale === "number" &&
          SCALES.includes(parsed.scale as (typeof SCALES)[number])
        ) {
          setScale(parsed.scale);
        }
        if (
          typeof parsed.theme === "string" &&
          MERMAID_THEMES.includes(parsed.theme as MermaidTheme)
        ) {
          setTheme(parsed.theme as MermaidTheme);
        }
        if (parsed.appMode === "dark" || parsed.appMode === "light") {
          setAppMode(parsed.appMode);
        }
        if (
          parsed.appTheme === "classic" ||
          parsed.appTheme === "ocean" ||
          parsed.appTheme === "forest" ||
          parsed.appTheme === "sunset"
        ) {
          setAppTheme(parsed.appTheme);
        }
        if (
          parsed.graphBackgroundStyle === "transparent" ||
          parsed.graphBackgroundStyle === "solid" ||
          parsed.graphBackgroundStyle === "soft-grid" ||
          parsed.graphBackgroundStyle === "dots" ||
          parsed.graphBackgroundStyle === "gradient" ||
          parsed.graphBackgroundStyle === "custom"
        ) {
          setGraphBackgroundStyle(parsed.graphBackgroundStyle);
        } else {
          setGraphBackgroundStyle(DEFAULT_GRAPH_BACKGROUND_STYLE);
        }
        if (typeof parsed.graphBackgroundColor === "string") {
          setGraphBackgroundColor(parsed.graphBackgroundColor);
        } else {
          setGraphBackgroundColor(DEFAULT_GRAPH_BACKGROUND_COLOR);
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

    const payload: PersistedState = {
      code,
      drafts,
      activeDraftId,
      theme,
      appMode,
      appTheme,
      graphBackgroundStyle,
      graphBackgroundColor,
      scale,
      splitRatio,
    };

    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeDraftId,
    appMode,
    appTheme,
    code,
    drafts,
    graphBackgroundColor,
    graphBackgroundStyle,
    isReady,
    scale,
    splitRatio,
    theme,
  ]);
}
