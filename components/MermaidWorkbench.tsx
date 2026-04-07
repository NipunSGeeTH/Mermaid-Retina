"use client";

import { useMemo, useRef, useState, type ChangeEvent, type PointerEvent } from "react";
import { Alert, Box, Snackbar, Typography, type SelectChangeEvent } from "@mui/material";
import { DIAGRAM_TEMPLATES } from "@/lib/diagramTemplates";
import { type MermaidTheme } from "@/lib/mermaidThemes";
import { SCALES } from "@/components/workbench/constants";
import WorkbenchPanels from "@/components/workbench/WorkbenchPanels";
import WorkbenchToolbar from "@/components/workbench/WorkbenchToolbar";
import { useMermaidPreview } from "@/components/workbench/useMermaidPreview";
import { useSplitLayout } from "@/components/workbench/useSplitLayout";
import { useWorkbenchPersistence } from "@/components/workbench/useWorkbenchPersistence";
import { canvasToPngBlob, loadSvgImage, triggerDownload } from "@/components/workbench/utils";
import type { MobilePanelMode, ToastState } from "@/components/workbench/types";

export default function MermaidWorkbench() {
  const [code, setCode] = useState<string>(DIAGRAM_TEMPLATES[0].code);
  const [theme, setTheme] = useState<MermaidTheme>("dark");
  const [scale, setScale] = useState<number>(2);
  const [templateId, setTemplateId] = useState<string>(DIAGRAM_TEMPLATES[0].id);
  const [mobilePanelMode, setMobilePanelMode] = useState<MobilePanelMode>("split");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "info" });
  const importFileRef = useRef<HTMLInputElement | null>(null);

  const { svg, error, isRendering, lastRenderedAt } = useMermaidPreview(code, theme);
  const { isDesktop, splitRatio, isDraggingSplit, splitContainerRef, startSplitDrag, setSplitRatio } =
    useSplitLayout(50);

  useWorkbenchPersistence({
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
  });

  const exportDisabled = !svg;
  const lineCount = useMemo<number>(() => (code ? code.split("\n").length : 0), [code]);
  const showEditorPanel = isDesktop || mobilePanelMode !== "preview";
  const showPreviewPanel = isDesktop || mobilePanelMode !== "editor";

  const showToast = (message: string, severity: ToastState["severity"]) => {
    setToast({ open: true, message, severity });
  };

  const handleExportPng = async () => {
    if (!svg) return;
    try {
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
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      triggerDownload(await canvasToPngBlob(canvas), `diagram-${scale}x.png`);
      showToast("PNG exported", "success");
    } catch (errorPng) {
      console.error("PNG export failed", errorPng);
      showToast("PNG export failed", "error");
    }
  };

  const handleExportSvg = () => {
    if (!svg) return;
    triggerDownload(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "diagram.svg");
    showToast("SVG exported", "success");
  };

  const handleDownloadSource = () => {
    triggerDownload(new Blob([code], { type: "text/plain;charset=utf-8" }), "diagram.mmd");
    showToast("Source downloaded", "success");
  };

  const handleImportSource = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setCode(await file.text());
      setTemplateId("custom");
      showToast("Source imported", "success");
    } catch {
      showToast("Import failed", "error");
    } finally {
      event.target.value = "";
    }
  };

  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;
    setTemplateId(selectedId);
    const template = DIAGRAM_TEMPLATES.find((item) => item.id === selectedId);
    if (template) {
      setCode(template.code);
      showToast(`Loaded "${template.name}" template`, "info");
    }
  };

  const handleStartSplitDrag = (event: PointerEvent<HTMLDivElement>) => startSplitDrag(event);

  return (
    <Box sx={{ p: { xs: 1.25, md: 2.5 }, minHeight: "100vh" }}>
      <WorkbenchToolbar
        error={error}
        isRendering={isRendering}
        lineCount={lineCount}
        charCount={code.length}
        lastRenderedAt={lastRenderedAt}
        templateId={templateId}
        theme={theme}
        scale={scale}
        scales={SCALES}
        exportDisabled={exportDisabled}
        isDesktop={isDesktop}
        mobilePanelMode={mobilePanelMode}
        onTemplateChange={handleTemplateChange}
        onThemeChange={(event) => setTheme(event.target.value as MermaidTheme)}
        onScaleChange={(event) => setScale(Number(event.target.value))}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onDownloadSource={handleDownloadSource}
        onImportClick={() => importFileRef.current?.click()}
        onMobilePanelModeChange={setMobilePanelMode}
      />

      <WorkbenchPanels
        isDesktop={isDesktop}
        splitRatio={splitRatio}
        isDraggingSplit={isDraggingSplit}
        showEditorPanel={showEditorPanel}
        showPreviewPanel={showPreviewPanel}
        code={code}
        templateId={templateId}
        error={error}
        svg={svg}
        splitContainerRef={splitContainerRef}
        onCodeChange={setCode}
        onConvertTemplateToCustom={() => setTemplateId("custom")}
        onStartSplitDrag={handleStartSplitDrag}
      />

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
        {templateId !== "custom"
          ? DIAGRAM_TEMPLATES.find((item) => item.id === templateId)?.description
          : "Custom diagram mode."}
      </Typography>

      <input ref={importFileRef} type="file" accept=".mmd,.mermaid,.txt" hidden onChange={handleImportSource} />
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

