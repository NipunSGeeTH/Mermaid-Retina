"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from "react";
import { Alert, Box, Paper, Skeleton, Snackbar, ThemeProvider, type SelectChangeEvent } from "@mui/material";
import { DIAGRAM_TEMPLATES } from "@/lib/diagramTemplates";
import { type MermaidTheme } from "@/lib/mermaidThemes";
import {
  DEFAULT_GRAPH_BACKGROUND_COLOR,
  DEFAULT_GRAPH_BACKGROUND_STYLE,
  SCALES,
} from "@/components/workbench/constants";
import ExportDialog from "@/components/workbench/ExportDialog";
import GraphTypeDialog from "@/components/workbench/GraphTypeDialog";
import SnapshotDialog from "@/components/workbench/SnapshotDialog";
import WorkbenchPanels from "@/components/workbench/WorkbenchPanels";
import ShareDialog from "@/components/workbench/ShareDialog";
import WorkbenchToolbar from "@/components/workbench/WorkbenchToolbar";
import ThemeDialog from "@/components/workbench/ThemeDialog";
import Footer from "@/components/Footer";
import { applyCanvasBackground, getPreviewBackgroundCss } from "@/components/workbench/graphBackground";
import { useMermaidPreview } from "@/components/workbench/useMermaidPreview";
import { useSplitLayout } from "@/components/workbench/useSplitLayout";
import { useWorkbenchPersistence } from "@/components/workbench/useWorkbenchPersistence";
import {
  buildShareHash,
  decodeCompressedDiagramFromFile,
  encodeCompressedDiagramForFile,
  parseSharedCodeFromHash,
} from "@/components/workbench/shareUrl";
import { buildWorkbenchTheme } from "@/components/workbench/themePresets";
import {
  canvasToBlob,
  loadSvgImage,
  makeSvgExportCompatible,
  triggerDownload,
} from "@/components/workbench/utils";
import type {
  AccessibilityMode,
  AppMode,
  AppThemeName,
  DraftItem,
  ExportType,
  GraphBackgroundStyle,
  MobilePanelMode,
  SnapshotItem,
  ToastState,
} from "@/components/workbench/types";

function createDraft(name: string, code: string): DraftItem {
  const now = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return { id: `draft-${now}-${random}`, name, code, updatedAt: now };
}

const INITIAL_DRAFT = createDraft("Draft 1", DIAGRAM_TEMPLATES[0].code);
const MAX_SHARE_URL_LENGTH = 3500;
const MAX_SNAPSHOTS = 40;
const AUTO_SNAPSHOT_DELAY_MS = 12000;

export default function MermaidWorkbench() {
  const [code, setCode] = useState<string>(DIAGRAM_TEMPLATES[0].code);
  const [drafts, setDrafts] = useState<DraftItem[]>([INITIAL_DRAFT]);
  const [activeDraftId, setActiveDraftId] = useState<string>(INITIAL_DRAFT.id);
  const [scale, setScale] = useState<number>(2);
  const [theme, setTheme] = useState<MermaidTheme>("dark");
  const [appMode, setAppMode] = useState<AppMode>("dark");
  const [appTheme, setAppTheme] = useState<AppThemeName>("classic");
  const [graphBackgroundStyle, setGraphBackgroundStyle] = useState<GraphBackgroundStyle>(
    DEFAULT_GRAPH_BACKGROUND_STYLE as GraphBackgroundStyle
  );
  const [graphBackgroundColor, setGraphBackgroundColor] = useState<string>(
    DEFAULT_GRAPH_BACKGROUND_COLOR
  );
  const [graphBackgroundImage, setGraphBackgroundImage] = useState<string>("");
  const [graphBackgroundImageWidth, setGraphBackgroundImageWidth] = useState<number>(800);
  const [graphBackgroundImageHeight, setGraphBackgroundImageHeight] = useState<number>(600);
  const [mobilePanelMode, setMobilePanelMode] = useState<MobilePanelMode>("split");
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>("standard");
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [graphOpen, setGraphOpen] = useState<boolean>(false);
  const [exportOpen, setExportOpen] = useState<boolean>(false);
  const [themeOpen, setThemeOpen] = useState<boolean>(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [shareFallbackCompressed, setShareFallbackCompressed] = useState<string>("");
  const [exportType, setExportType] = useState<ExportType>("png");
  const [exportTransparent, setExportTransparent] = useState<boolean>(false);
  const [pdfSize, setPdfSize] = useState<string>("a4");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DIAGRAM_TEMPLATES[0].id);
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "info" });
  const importFileRef = useRef<HTMLInputElement | null>(null);
  const snapshotTimerRef = useRef<number | null>(null);
  const lastAutoSnapshotCodeRef = useRef<string>(code);

  const { svg, error, isRendering, renderTimedOut, diagnostics, retryRender } = useMermaidPreview(code, theme);
  const { isDesktop, splitRatio, isDraggingSplit, splitContainerRef, startSplitDrag, setSplitRatio } = useSplitLayout(50);

  useWorkbenchPersistence({
    code,
    drafts,
    activeDraftId,
    theme,
    appMode,
    appTheme,
    graphBackgroundStyle,
    graphBackgroundColor,
    graphBackgroundImage,
    graphBackgroundImageWidth,
    graphBackgroundImageHeight,
    scale,
    splitRatio,
    snapshots,
    accessibilityMode,
    isReady,
    setCode,
    setDrafts,
    setActiveDraftId,
    setTheme,
    setAppMode,
    setAppTheme,
    setGraphBackgroundStyle,
    setGraphBackgroundColor,
    setGraphBackgroundImage,
    setGraphBackgroundImageWidth,
    setGraphBackgroundImageHeight,
    setScale,
    setSplitRatio,
    setSnapshots,
    setAccessibilityMode,
    setIsReady,
  });

  const showEditorPanel = isDesktop || mobilePanelMode !== "preview";
  const showPreviewPanel = isDesktop || mobilePanelMode !== "editor";

  const showToast = (message: string, severity: ToastState["severity"]) => {
    setToast({ open: true, message, severity });
  };

  const appendSnapshot = useCallback((snapshotCode: string, reason: SnapshotItem["reason"]) => {
    const normalized = snapshotCode.trim();
    if (!normalized) {
      return;
    }
    setSnapshots((prev) => {
      if (prev[0]?.code === snapshotCode) {
        return prev;
      }
      const createdAt = Date.now();
      const id = `snapshot-${createdAt}-${Math.random().toString(36).slice(2, 8)}`;
      return [{ id, code: snapshotCode, createdAt, reason }, ...prev].slice(0, MAX_SNAPSHOTS);
    });
  }, []);

  const handleCreateManualSnapshot = useCallback(() => {
    appendSnapshot(code, "manual");
    showToast("Snapshot created", "success");
  }, [appendSnapshot, code]);

  const handleRestoreSnapshot = (snapshotId: string) => {
    const target = snapshots.find((item) => item.id === snapshotId);
    if (!target) {
      return;
    }
    setCode(target.code);
    setHistoryOpen(false);
    showToast("Snapshot restored", "success");
  };

  const handleSelectDraft = (draftId: string) => {
    const nextDraft = drafts.find((item) => item.id === draftId);
    if (!nextDraft) {
      return;
    }
    setActiveDraftId(nextDraft.id);
    setCode(nextDraft.code);
  };

  const handleCreateDraft = () => {
    const nextNumber = drafts.length + 1;
    const nextDraft = createDraft(`Draft ${nextNumber}`, code);
    setDrafts((prev) => [...prev, nextDraft]);
    setActiveDraftId(nextDraft.id);
    setCode(nextDraft.code);
    showToast("New draft created", "success");
  };

  const handleDeleteDraft = (draftId: string) => {
    if (drafts.length <= 1) {
      showToast("At least one draft is required", "info");
      return;
    }

    setDrafts((prev) => {
      const currentIndex = prev.findIndex((item) => item.id === draftId);
      const nextDrafts = prev.filter((item) => item.id !== draftId);

      if (activeDraftId === draftId) {
        const fallbackIndex = Math.max(0, currentIndex - 1);
        const fallbackDraft = nextDrafts[fallbackIndex] ?? nextDrafts[0];
        if (fallbackDraft) {
          setActiveDraftId(fallbackDraft.id);
          setCode(fallbackDraft.code);
        }
      }
      return nextDrafts;
    });
    showToast("Draft deleted", "success");
  };

  const handleShareLink = () => {
    if (typeof window === "undefined") {
      return;
    }

    const shareHash = buildShareHash(code);
    if (!shareHash) {
      showToast("Unable to generate share link", "error");
      return;
    }

    const relativeUrl = `${window.location.pathname}${window.location.search}#${shareHash}`;
    const absoluteUrl = `${window.location.origin}${relativeUrl}`;
    if (absoluteUrl.length > MAX_SHARE_URL_LENGTH) {
      setShareUrl("");
      setShareFallbackCompressed(encodeCompressedDiagramForFile(code));
      setShareOpen(true);
      showToast("Diagram too large for URL share. Use compressed file.", "info");
      return;
    }

    setShareFallbackCompressed("");
    setShareUrl(absoluteUrl);
    setShareOpen(true);
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Share link copied", "success");
    } catch {
      showToast("Copy failed", "error");
    }
  };

  const handleDownloadCompressedShare = () => {
    if (!shareFallbackCompressed) {
      return;
    }
    triggerDownload(
      new Blob([shareFallbackCompressed], { type: "text/plain;charset=utf-8" }),
      "diagram.mmdz"
    );
    showToast("Compressed share file downloaded", "success");
  };

  const exportImage = async (format: "png" | "jpg") => {
    if (!svg) return;
    const safeSvg = makeSvgExportCompatible(svg);
    const svgBlob = new Blob([safeSvg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    let image: HTMLImageElement;
    try {
      image = await loadSvgImage(svgUrl);
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context unavailable");
    context.clearRect(0, 0, canvas.width, canvas.height);
    const mustOpaque = format === "jpg";
    const shouldDrawBackground = mustOpaque || !exportTransparent;
    if (shouldDrawBackground) {
      const style = mustOpaque && graphBackgroundStyle === "transparent" ? "solid" : graphBackgroundStyle;
      const color = mustOpaque && graphBackgroundStyle === "transparent" ? "#ffffff" : graphBackgroundColor;
      await applyCanvasBackground(context, canvas.width, canvas.height, style, color, appMode, graphBackgroundImage, graphBackgroundImageWidth, graphBackgroundImageHeight);
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, format === "jpg" ? "image/jpeg" : "image/png", 0.92);
    triggerDownload(blob, `diagram-${scale}x.${format}`);
  };

  const exportPdf = async () => {
    if (!svg) return;
    const safeSvg = makeSvgExportCompatible(svg);
    const svgBlob = new Blob([safeSvg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    let image: HTMLImageElement;
    try {
      image = await loadSvgImage(svgUrl);
    } finally {
      URL.revokeObjectURL(svgUrl);
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    
    // Apply background with support for images
    const style = graphBackgroundStyle === "transparent" ? "solid" : graphBackgroundStyle;
    const color = graphBackgroundStyle === "transparent" ? "#ffffff" : graphBackgroundColor;
    await applyCanvasBackground(ctx, canvas.width, canvas.height, style, color, appMode, graphBackgroundImage, graphBackgroundImageWidth, graphBackgroundImageHeight);
    
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.95);
    const orientation = canvas.width >= canvas.height ? "landscape" : "portrait";
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation, unit: "mm", format: pdfSize });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const renderWidth = canvas.width * ratio;
    const renderHeight = canvas.height * ratio;
    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;
    pdf.addImage(imageData, "JPEG", x, y, renderWidth, renderHeight);
    pdf.save(`diagram-${pdfSize}.pdf`);
  };

  const exportSelected = async () => {
    try {
      if (exportType === "png") {
        await exportImage("png");
      } else if (exportType === "jpg") {
        await exportImage("jpg");
      } else if (exportType === "pdf") {
        await exportPdf();
      } else if (exportType === "svg") {
        if (!svg) return;
        const safeSvg = makeSvgExportCompatible(svg);
        triggerDownload(new Blob([safeSvg], { type: "image/svg+xml;charset=utf-8" }), "diagram.svg");
      } else {
        triggerDownload(new Blob([code], { type: "text/plain;charset=utf-8" }), "diagram.mmd");
      }
      setExportOpen(false);
      showToast("Export complete", "success");
    } catch (exportError) {
      console.error("Export failed", exportError);
      showToast("Export failed", "error");
    }
  };

  const handleImportSource = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const isCompressedFile = file.name.toLowerCase().endsWith(".mmdz");
      if (isCompressedFile) {
        const decompressed = decodeCompressedDiagramFromFile(text);
        if (!decompressed) {
          showToast("Compressed import is invalid", "error");
          return;
        }
        setCode(decompressed);
      } else {
        setCode(text);
      }
      showToast("Source imported", "success");
    } catch {
      showToast("Import failed", "error");
    } finally {
      event.target.value = "";
    }
  };

  const handleStartSplitDrag = (event: PointerEvent<HTMLDivElement>) => startSplitDrag(event);

  const handleThemeChange = (event: SelectChangeEvent<string>) => setTheme(event.target.value as MermaidTheme);
  const handleAppModeChange = (event: SelectChangeEvent<string>) => setAppMode(event.target.value as AppMode);
  const handleAppThemeChange = (event: SelectChangeEvent<string>) => setAppTheme(event.target.value as AppThemeName);
  const handleAccessibilityModeChange = (event: SelectChangeEvent<string>) =>
    setAccessibilityMode(event.target.value as AccessibilityMode);
  const uiTheme = useMemo(
    () => buildWorkbenchTheme(appTheme, appMode, accessibilityMode),
    [accessibilityMode, appMode, appTheme]
  );
  const previewBackground = useMemo(
    () => getPreviewBackgroundCss(graphBackgroundStyle, graphBackgroundColor, appMode, graphBackgroundImage, graphBackgroundImageWidth, graphBackgroundImageHeight),
    [appMode, graphBackgroundColor, graphBackgroundStyle, graphBackgroundImage, graphBackgroundImageWidth, graphBackgroundImageHeight]
  );

  useEffect(() => {
    const activeDraft = drafts.find((item) => item.id === activeDraftId);
    if (!activeDraft || activeDraft.code === code) {
      return;
    }

    setDrafts((prev) =>
      prev.map((item) =>
        item.id === activeDraftId ? { ...item, code, updatedAt: Date.now() } : item
      )
    );
  }, [activeDraftId, code, drafts]);

  useEffect(() => {
    lastAutoSnapshotCodeRef.current = code;
  }, [activeDraftId]);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      return;
    }
    if (snapshotTimerRef.current !== null) {
      window.clearTimeout(snapshotTimerRef.current);
    }
    snapshotTimerRef.current = window.setTimeout(() => {
      if (lastAutoSnapshotCodeRef.current === code) {
        return;
      }
      appendSnapshot(code, "auto");
      lastAutoSnapshotCodeRef.current = code;
    }, AUTO_SNAPSHOT_DELAY_MS);

    return () => {
      if (snapshotTimerRef.current !== null) {
        window.clearTimeout(snapshotTimerRef.current);
      }
    };
  }, [appendSnapshot, code, isReady]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const applySharedHash = () => {
      const parsed = parseSharedCodeFromHash(window.location.hash);
      if (!parsed.hasShareCode) {
        return;
      }
      if (parsed.code === null) {
        showToast("Invalid share link", "error");
        return;
      }
      setCode(parsed.code);
      showToast("Loaded diagram from share link", "success");
    };

    applySharedHash();
    window.addEventListener("hashchange", applySharedHash);
    return () => window.removeEventListener("hashchange", applySharedHash);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const isMod = event.ctrlKey || event.metaKey;
      if (isMod && event.shiftKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        setHistoryOpen(true);
        return;
      }
      if (isMod && event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleCreateManualSnapshot();
        return;
      }
      if (isMod && event.key.toLowerCase() === "e") {
        event.preventDefault();
        setExportOpen(true);
        return;
      }
      if (!isDesktop && event.altKey) {
        if (event.key === "1") {
          event.preventDefault();
          setMobilePanelMode("split");
        } else if (event.key === "2") {
          event.preventDefault();
          setMobilePanelMode("editor");
        } else if (event.key === "3") {
          event.preventDefault();
          setMobilePanelMode("preview");
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleCreateManualSnapshot, isDesktop]);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Service worker registration is optional.
    });
  }, []);

  const showStartupSkeleton = !isReady;

  return (
    <ThemeProvider theme={uiTheme}>
      <Box sx={{ p: { xs: 1.25, md: 2.5 }, height: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default", color: "text.primary" }}>
      {showStartupSkeleton ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 1 }}>
            <Skeleton variant="text" width={180} height={36} />
            <Skeleton variant="rounded" height={34} />
          </Paper>
          <Paper
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider", p: 1.5, flex: 1, minHeight: 0 }}
          >
            <Skeleton variant="rounded" height="100%" />
          </Paper>
        </Box>
      ) : (
        <>
      <WorkbenchToolbar
        isDesktop={isDesktop}
        mobilePanelMode={mobilePanelMode}
        canExport={Boolean(svg || code.trim())}
        drafts={drafts}
        activeDraftId={activeDraftId}
        onSelectDraft={handleSelectDraft}
        onCreateDraft={handleCreateDraft}
        onDeleteDraft={handleDeleteDraft}
        onShareLink={handleShareLink}
        onOpenGraph={() => setGraphOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenTheme={() => setThemeOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onImportClick={() => importFileRef.current?.click()}
        onMobilePanelModeChange={setMobilePanelMode}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <WorkbenchPanels
          isDesktop={isDesktop}
          splitRatio={splitRatio}
          isDraggingSplit={isDraggingSplit}
          showEditorPanel={showEditorPanel}
          showPreviewPanel={showPreviewPanel}
          code={code}
          error={error}
          svg={svg}
          isRendering={isRendering}
          renderTimedOut={renderTimedOut}
          diagnostics={diagnostics}
          previewBackground={previewBackground}
          graphBackgroundStyle={graphBackgroundStyle}
          graphBackgroundImageWidth={graphBackgroundImageWidth}
          graphBackgroundImageHeight={graphBackgroundImageHeight}
          splitContainerRef={splitContainerRef}
          onCodeChange={setCode}
          onRetryRender={retryRender}
          onStartSplitDrag={handleStartSplitDrag}
        />
      </Box>

      <input ref={importFileRef} type="file" accept=".mmd,.mermaid,.txt,.mmdz" hidden onChange={handleImportSource} />

      <GraphTypeDialog
        open={graphOpen}
        templates={DIAGRAM_TEMPLATES}
        selectedTemplateId={selectedTemplateId}
        onClose={() => setGraphOpen(false)}
        onTemplateChange={(event) => setSelectedTemplateId(event.target.value)}
        onApply={() => {
          const selected = DIAGRAM_TEMPLATES.find((item) => item.id === selectedTemplateId);
          if (selected) {
            setCode(selected.code);
            showToast(`Loaded ${selected.name} sample`, "success");
          }
          setGraphOpen(false);
        }}
      />

      <ExportDialog
        open={exportOpen}
        exportType={exportType}
        exportTransparent={exportTransparent}
        pdfSize={pdfSize}
        scale={scale}
        scales={SCALES}
        onClose={() => setExportOpen(false)}
        onExportTypeChange={(event) => {
          const nextType = event.target.value as ExportType;
          setExportType(nextType);
          if (nextType === "jpg") {
            setExportTransparent(false);
          }
        }}
        onExportTransparentChange={setExportTransparent}
        onPdfSizeChange={(event) => setPdfSize(event.target.value)}
        onScaleChange={(event) => setScale(Number(event.target.value))}
        onConfirm={exportSelected}
      />

      <ThemeDialog
        open={themeOpen}
        theme={theme}
        appMode={appMode}
        appTheme={appTheme}
        accessibilityMode={accessibilityMode}
        graphBackgroundStyle={graphBackgroundStyle}
        graphBackgroundColor={graphBackgroundColor}
        graphBackgroundImage={graphBackgroundImage}
        graphBackgroundImageWidth={graphBackgroundImageWidth}
        graphBackgroundImageHeight={graphBackgroundImageHeight}
        onClose={() => setThemeOpen(false)}
        onThemeChange={handleThemeChange}
        onAppModeChange={handleAppModeChange}
        onAppThemeChange={handleAppThemeChange}
        onAccessibilityModeChange={handleAccessibilityModeChange}
        onGraphBackgroundStyleChange={(event) =>
          setGraphBackgroundStyle(event.target.value as GraphBackgroundStyle)
        }
        onGraphBackgroundColorChange={setGraphBackgroundColor}
        onGraphBackgroundImageChange={setGraphBackgroundImage}
        onGraphBackgroundImageWidthChange={setGraphBackgroundImageWidth}
        onGraphBackgroundImageHeightChange={setGraphBackgroundImageHeight}
      />

      <SnapshotDialog
        open={historyOpen}
        snapshots={snapshots}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestoreSnapshot}
        onCreateManual={handleCreateManualSnapshot}
      />

      <ShareDialog
        open={shareOpen}
        shareUrl={shareUrl}
        isLongShareFallback={Boolean(shareFallbackCompressed) && !shareUrl}
        onClose={() => {
          setShareOpen(false);
          setShareFallbackCompressed("");
        }}
        onCopy={handleCopyShareLink}
        onDownloadCompressed={handleDownloadCompressedShare}
      />

      <Footer />

      <Snackbar open={toast.open} autoHideDuration={2500} onClose={() => setToast((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
      </>
      )}
      </Box>
    </ThemeProvider>
  );
}
