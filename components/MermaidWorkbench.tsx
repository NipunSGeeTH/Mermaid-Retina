"use client";

import { useMemo, useRef, useState, type ChangeEvent, type PointerEvent } from "react";
import { Alert, Box, Snackbar, ThemeProvider, type SelectChangeEvent } from "@mui/material";
import { DIAGRAM_TEMPLATES } from "@/lib/diagramTemplates";
import { type MermaidTheme } from "@/lib/mermaidThemes";
import {
  DEFAULT_GRAPH_BACKGROUND_COLOR,
  DEFAULT_GRAPH_BACKGROUND_STYLE,
  SCALES,
} from "@/components/workbench/constants";
import ExportDialog from "@/components/workbench/ExportDialog";
import GraphTypeDialog from "@/components/workbench/GraphTypeDialog";
import WorkbenchPanels from "@/components/workbench/WorkbenchPanels";
import WorkbenchToolbar from "@/components/workbench/WorkbenchToolbar";
import ThemeDialog from "@/components/workbench/ThemeDialog";
import { applyCanvasBackground, getPreviewBackgroundCss } from "@/components/workbench/graphBackground";
import { useMermaidPreview } from "@/components/workbench/useMermaidPreview";
import { useSplitLayout } from "@/components/workbench/useSplitLayout";
import { useWorkbenchPersistence } from "@/components/workbench/useWorkbenchPersistence";
import { buildWorkbenchTheme } from "@/components/workbench/themePresets";
import {
  canvasToBlob,
  loadSvgImage,
  makeSvgExportCompatible,
  triggerDownload,
} from "@/components/workbench/utils";
import type {
  AppMode,
  AppThemeName,
  ExportType,
  GraphBackgroundStyle,
  MobilePanelMode,
  ToastState,
} from "@/components/workbench/types";

export default function MermaidWorkbench() {
  const [code, setCode] = useState<string>(DIAGRAM_TEMPLATES[0].code);
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
  const [mobilePanelMode, setMobilePanelMode] = useState<MobilePanelMode>("split");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [graphOpen, setGraphOpen] = useState<boolean>(false);
  const [exportOpen, setExportOpen] = useState<boolean>(false);
  const [themeOpen, setThemeOpen] = useState<boolean>(false);
  const [exportType, setExportType] = useState<ExportType>("png");
  const [exportTransparent, setExportTransparent] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DIAGRAM_TEMPLATES[0].id);
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "info" });
  const importFileRef = useRef<HTMLInputElement | null>(null);

  const { svg, error } = useMermaidPreview(code, theme);
  const { isDesktop, splitRatio, isDraggingSplit, splitContainerRef, startSplitDrag, setSplitRatio } = useSplitLayout(50);

  useWorkbenchPersistence({
    code,
    theme,
    appMode,
    appTheme,
    graphBackgroundStyle,
    graphBackgroundColor,
    scale,
    splitRatio,
    isReady,
    setCode,
    setTheme,
    setAppMode,
    setAppTheme,
    setGraphBackgroundStyle,
    setGraphBackgroundColor,
    setScale,
    setSplitRatio,
    setIsReady,
  });

  const showEditorPanel = isDesktop || mobilePanelMode !== "preview";
  const showPreviewPanel = isDesktop || mobilePanelMode !== "editor";

  const showToast = (message: string, severity: ToastState["severity"]) => {
    setToast({ open: true, message, severity });
  };

  const exportImage = async (format: "png" | "jpg") => {
    if (!svg) return;
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
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
      applyCanvasBackground(context, canvas.width, canvas.height, style, color, appMode);
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, format === "jpg" ? "image/jpeg" : "image/png", 0.92);
    triggerDownload(blob, `diagram-${scale}x.${format}`);
  };

  const exportSelected = async () => {
    try {
      if (exportType === "png") {
        await exportImage("png");
      } else if (exportType === "jpg") {
        await exportImage("jpg");
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
      setCode(await file.text());
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
  const uiTheme = useMemo(() => buildWorkbenchTheme(appTheme, appMode), [appMode, appTheme]);
  const previewBackground = useMemo(
    () => getPreviewBackgroundCss(graphBackgroundStyle, graphBackgroundColor, appMode),
    [appMode, graphBackgroundColor, graphBackgroundStyle]
  );

  return (
    <ThemeProvider theme={uiTheme}>
      <Box sx={{ p: { xs: 1.25, md: 2.5 }, height: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default", color: "text.primary" }}>
      <WorkbenchToolbar
        isDesktop={isDesktop}
        mobilePanelMode={mobilePanelMode}
        canExport={Boolean(svg || code.trim())}
        onOpenGraph={() => setGraphOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenTheme={() => setThemeOpen(true)}
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
          previewBackground={previewBackground}
          splitContainerRef={splitContainerRef}
          onCodeChange={setCode}
          onStartSplitDrag={handleStartSplitDrag}
        />
      </Box>

      <input ref={importFileRef} type="file" accept=".mmd,.mermaid,.txt" hidden onChange={handleImportSource} />

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
        onScaleChange={(event) => setScale(Number(event.target.value))}
        onConfirm={exportSelected}
      />

      <ThemeDialog
        open={themeOpen}
        theme={theme}
        appMode={appMode}
        appTheme={appTheme}
        graphBackgroundStyle={graphBackgroundStyle}
        graphBackgroundColor={graphBackgroundColor}
        onClose={() => setThemeOpen(false)}
        onThemeChange={handleThemeChange}
        onAppModeChange={handleAppModeChange}
        onAppThemeChange={handleAppThemeChange}
        onGraphBackgroundStyleChange={(event) =>
          setGraphBackgroundStyle(event.target.value as GraphBackgroundStyle)
        }
        onGraphBackgroundColorChange={setGraphBackgroundColor}
      />

      <Snackbar open={toast.open} autoHideDuration={2500} onClose={() => setToast((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
