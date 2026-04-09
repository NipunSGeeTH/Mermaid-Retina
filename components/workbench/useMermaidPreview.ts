"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import type { MermaidTheme } from "@/lib/mermaidThemes";
import type { RenderDiagnostics, RenderSource } from "@/components/workbench/types";

type MermaidPreviewState = {
  svg: string;
  error: string;
  isRendering: boolean;
  renderTimedOut: boolean;
  lastRenderedAt: string;
  diagnostics: RenderDiagnostics;
  retryRender: () => void;
};

type CachedRender = {
  svg: string;
  renderedAt: string;
  durationMs: number;
};

type StorageCachePayload = {
  entries: Array<[string, CachedRender]>;
};

type WorkerRenderResponse = {
  requestId: number;
  ok: boolean;
  svg?: string;
  error?: string;
};

const MAX_CACHE_ENTRIES = 30;
const RENDER_TIMEOUT_MS = 7000;
const STORAGE_KEY = "mermaid-render-cache-v1";

const WORKER_MODULE_URL =
  "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

function createRenderWorker(): Worker {
  const workerScript = `
let mermaidModulePromise = null;

async function getMermaid() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("${WORKER_MODULE_URL}").then((mod) => mod.default ?? mod);
  }
  return mermaidModulePromise;
}

self.onmessage = async (event) => {
  const data = event.data || {};
  const requestId = data.requestId;
  const code = data.code;
  const theme = data.theme;

  try {
    const mermaid = await getMermaid();
    mermaid.initialize({
      startOnLoad: false,
      theme,
      flowchart: { htmlLabels: false },
      mindmap: { padding: 12 },
      sequence: { useMaxWidth: true },
    });

    const id = "worker-mermaid-" + requestId;
    const result = await mermaid.render(id, code);
    self.postMessage({ requestId, ok: true, svg: result.svg });
  } catch (error) {
    self.postMessage({
      requestId,
      ok: false,
      error: error instanceof Error ? error.message : "Worker render failed",
    });
  }
};`;

  const blob = new Blob([workerScript], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url, { type: "module" });
  URL.revokeObjectURL(url);
  return worker;
}

function trimCache(cache: Map<string, CachedRender>): void {
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (!oldestKey) {
      return;
    }
    cache.delete(oldestKey);
  }
}

function loadCacheFromStorage(): Map<string, CachedRender> {
  if (typeof window === "undefined") {
    return new Map();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Map();
    }

    const parsed = JSON.parse(raw) as StorageCachePayload;
    const map = new Map<string, CachedRender>();
    for (const [key, value] of parsed.entries ?? []) {
      if (
        typeof key === "string" &&
        value &&
        typeof value.svg === "string" &&
        typeof value.renderedAt === "string" &&
        typeof value.durationMs === "number"
      ) {
        map.set(key, value);
      }
    }
    trimCache(map);
    return map;
  } catch {
    return new Map();
  }
}

function saveCacheToStorage(cache: Map<string, CachedRender>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: StorageCachePayload = {
      entries: Array.from(cache.entries()),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota and serialization errors.
  }
}

async function renderOnMainThread(code: string, theme: MermaidTheme, requestId: number): Promise<string> {
  mermaid.initialize({
    startOnLoad: false,
    theme,
    flowchart: { htmlLabels: false },
    mindmap: { padding: 12 },
    sequence: { useMaxWidth: true },
  });
  const { svg } = await mermaid.render(`mermaid-${requestId}`, code);
  return svg;
}

export function useMermaidPreview(code: string, theme: MermaidTheme): MermaidPreviewState {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [lastRenderedAt, setLastRenderedAt] = useState<string>("");
  const [renderTimedOut, setRenderTimedOut] = useState<boolean>(false);
  const [retryNonce, setRetryNonce] = useState<number>(0);
  const [diagnostics, setDiagnostics] = useState<RenderDiagnostics>({
    source: "none",
    durationMs: null,
    cacheHit: false,
    cacheEntries: 0,
    timedOut: false,
    lastError: "",
    lastRenderedAt: "",
  });

  const renderTokenRef = useRef<number>(0);
  const requestCounterRef = useRef<number>(0);
  const renderCacheRef = useRef<Map<string, CachedRender>>(new Map());
  const cacheLoadedRef = useRef<boolean>(false);
  const storageKeysRef = useRef<Set<string>>(new Set());
  const cacheSaveTimerRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerSupportedRef = useRef<boolean>(true);

  useEffect(() => {
    if (cacheLoadedRef.current) {
      return;
    }
    renderCacheRef.current = loadCacheFromStorage();
    storageKeysRef.current = new Set(renderCacheRef.current.keys());
    cacheLoadedRef.current = true;
    setDiagnostics((prev) => ({
      ...prev,
      cacheEntries: renderCacheRef.current.size,
    }));
  }, []);

  useEffect(() => {
    if (cacheSaveTimerRef.current !== null) {
      window.clearTimeout(cacheSaveTimerRef.current);
    }
    cacheSaveTimerRef.current = window.setTimeout(() => {
      saveCacheToStorage(renderCacheRef.current);
    }, 300);

    return () => {
      if (cacheSaveTimerRef.current !== null) {
        window.clearTimeout(cacheSaveTimerRef.current);
      }
    };
  }, [svg, theme]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const retryRender = useCallback(() => {
    setRetryNonce((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed) {
      setSvg("");
      setError("");
      setIsRendering(false);
      setRenderTimedOut(false);
      setDiagnostics((prev) => ({
        ...prev,
        source: "none",
        durationMs: null,
        cacheHit: false,
        timedOut: false,
        lastError: "",
        lastRenderedAt: "",
        cacheEntries: renderCacheRef.current.size,
      }));
      return;
    }

    const token = ++renderTokenRef.current;
    const requestId = ++requestCounterRef.current;
    const cacheKey = `${theme}::${trimmed}`;

    const cached = renderCacheRef.current.get(cacheKey);
    if (cached) {
      setSvg(cached.svg);
      setError("");
      setIsRendering(false);
      setRenderTimedOut(false);
      setLastRenderedAt(cached.renderedAt);
      setDiagnostics({
        source: storageKeysRef.current.has(cacheKey) ? "cache-storage" : "cache-memory",
        durationMs: cached.durationMs,
        cacheHit: true,
        cacheEntries: renderCacheRef.current.size,
        timedOut: false,
        lastError: "",
        lastRenderedAt: cached.renderedAt,
      });
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        let resolved = false;
        let source: RenderSource = "main-thread";
        const startedAt = performance.now();

        const finish = (payload: {
          ok: boolean;
          renderedSvg?: string;
          errorMessage?: string;
          sourceType: RenderSource;
          timedOut?: boolean;
        }) => {
          if (resolved || token !== renderTokenRef.current) {
            return;
          }
          resolved = true;
          const durationMs = Math.max(0, Math.round(performance.now() - startedAt));

          if (payload.ok && payload.renderedSvg) {
            const renderedAt = new Date().toLocaleTimeString();
            const next: CachedRender = {
              svg: payload.renderedSvg,
              renderedAt,
              durationMs,
            };
            renderCacheRef.current.set(cacheKey, next);
            storageKeysRef.current.delete(cacheKey);
            trimCache(renderCacheRef.current);
            saveCacheToStorage(renderCacheRef.current);

            setSvg(payload.renderedSvg);
            setError("");
            setLastRenderedAt(renderedAt);
            setRenderTimedOut(false);
            setDiagnostics({
              source: payload.sourceType,
              durationMs,
              cacheHit: false,
              cacheEntries: renderCacheRef.current.size,
              timedOut: false,
              lastError: "",
              lastRenderedAt: renderedAt,
            });
          } else {
            const finalError = payload.errorMessage || "Unknown Mermaid render error";
            setSvg("");
            setError(finalError);
            setRenderTimedOut(Boolean(payload.timedOut));
            setDiagnostics({
              source: payload.sourceType,
              durationMs,
              cacheHit: false,
              cacheEntries: renderCacheRef.current.size,
              timedOut: Boolean(payload.timedOut),
              lastError: finalError,
              lastRenderedAt,
            });
          }

          setIsRendering(false);
        };

        setIsRendering(true);
        setRenderTimedOut(false);

        const timeoutId = window.setTimeout(() => {
          finish({
            ok: false,
            sourceType: source,
            timedOut: true,
            errorMessage: "Rendering timed out. Tap Retry.",
          });
        }, RENDER_TIMEOUT_MS);

        const clearTimers = () => {
          window.clearTimeout(timeoutId);
        };

        try {
          if (workerSupportedRef.current) {
            try {
              if (!workerRef.current) {
                workerRef.current = createRenderWorker();
              }

              const worker = workerRef.current;
              source = "worker";

              const response = await new Promise<WorkerRenderResponse>((resolve, reject) => {
                const onMessage = (event: MessageEvent<WorkerRenderResponse>) => {
                  const message = event.data;
                  if (!message || message.requestId !== requestId) {
                    return;
                  }
                  worker.removeEventListener("message", onMessage);
                  worker.removeEventListener("error", onError);
                  resolve(message);
                };

                const onError = (event: ErrorEvent) => {
                  worker.removeEventListener("message", onMessage);
                  worker.removeEventListener("error", onError);
                  reject(new Error(event.message || "Worker error"));
                };

                worker.addEventListener("message", onMessage);
                worker.addEventListener("error", onError);
                worker.postMessage({ requestId, code: trimmed, theme });
              });

              if (response.ok && response.svg) {
                clearTimers();
                finish({ ok: true, renderedSvg: response.svg, sourceType: "worker" });
                return;
              }

              throw new Error(response.error || "Worker render failed");
            } catch {
              workerSupportedRef.current = false;
              if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
              }
            }
          }

          source = "main-thread";
          const renderedSvg = await renderOnMainThread(trimmed, theme, requestId);
          clearTimers();
          finish({ ok: true, renderedSvg, sourceType: "main-thread" });
        } catch (renderError: unknown) {
          clearTimers();
          const message = renderError instanceof Error ? renderError.message : "Unknown Mermaid render error";
          finish({ ok: false, errorMessage: message, sourceType: source });
        }
      })();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [code, theme, retryNonce]);

  return {
    svg,
    error,
    isRendering,
    renderTimedOut,
    lastRenderedAt,
    diagnostics,
    retryRender,
  };
}
