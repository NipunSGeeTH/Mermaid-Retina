"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Typography,
  type AlertColor,
  type SelectChangeEvent,
} from "@mui/material";
import { DIAGRAM_TEMPLATES } from "@/lib/diagramTemplates";
import { MERMAID_THEMES, type MermaidTheme } from "@/lib/mermaidThemes";

const SCALES = [1, 2, 4] as const;
const STORAGE_KEY = "mermaid-workbench-v1";

type ToastState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

type PersistedState = {
  code: string;
  theme: MermaidTheme;
  scale: number;
  templateId: string;
};

export default function MermaidWorkbench() {
  const [code, setCode] = useState<string>(DIAGRAM_TEMPLATES[0].code);
  const [theme, setTheme] = useState<MermaidTheme>("dark");
  const [scale, setScale] = useState<number>(2);
  const [templateId, setTemplateId] = useState<string>(DIAGRAM_TEMPLATES[0].id);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [lastRenderedAt, setLastRenderedAt] = useState<string>("");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info",
  });
  const renderTokenRef = useRef<number>(0);
  const importFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme });
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    const themeParam = params.get("theme");
    const scaleParam = params.get("scale");

    if (codeParam) {
      setCode(codeParam);
      setTemplateId("custom");
    } else {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          if (typeof parsed.code === "string" && parsed.code.trim()) {
            setCode(parsed.code);
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
        }
      } catch {
        // ignore invalid local storage payload
      }
    }

    if (themeParam && MERMAID_THEMES.includes(themeParam as MermaidTheme)) {
      setTheme(themeParam as MermaidTheme);
    }
    if (scaleParam) {
      const parsedScale = Number(scaleParam);
      if (SCALES.includes(parsedScale as 1 | 2 | 4)) {
        setScale(parsedScale);
      }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      return;
    }
    const payload: PersistedState = { code, theme, scale, templateId };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [code, theme, scale, templateId, isReady]);

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

  const exportDisabled = useMemo<boolean>(() => !svg, [svg]);
  const charCount = useMemo<number>(() => code.length, [code]);
  const lineCount = useMemo<number>(() => (code ? code.split("\n").length : 0), [code]);

  const handleExportPng = async () => {
    if (!svg) {
      return;
    }
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
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas context unavailable");
      }

      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const pngBlob = await canvasToPngBlob(canvas);
      triggerDownload(pngBlob, `diagram-${scale}x.png`);
      showToast("PNG exported", "success");
    } catch (exportError) {
      console.error("PNG export failed", exportError);
      showToast("PNG export failed", "error");
    }
  };

  const handleExportSvg = () => {
    if (!svg) {
      return;
    }
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    triggerDownload(blob, "diagram.svg");
    showToast("SVG exported", "success");
  };

  const handleDownloadSource = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    triggerDownload(blob, "diagram.mmd");
    showToast("Source downloaded", "success");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast("Code copied", "success");
    } catch {
      showToast("Could not copy code", "error");
    }
  };

  const handleCopySvg = async () => {
    if (!svg) {
      return;
    }
    try {
      await navigator.clipboard.writeText(svg);
      showToast("SVG copied", "success");
    } catch {
      showToast("Could not copy SVG", "error");
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("code", code);
    url.searchParams.set("theme", theme);
    url.searchParams.set("scale", String(scale));
    try {
      await navigator.clipboard.writeText(url.toString());
      showToast("Share URL copied", "success");
    } catch {
      showToast("Could not copy share URL", "error");
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

  const handleThemeChange = (event: SelectChangeEvent<string>) => {
    setTheme(event.target.value as MermaidTheme);
  };

  const handleScaleChange = (event: SelectChangeEvent<number>) => {
    setScale(Number(event.target.value));
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleImportSource = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const content = await file.text();
      setCode(content);
      setTemplateId("custom");
      showToast("Source imported", "success");
    } catch {
      showToast("Import failed", "error");
    } finally {
      event.target.value = "";
    }
  };

  const showToast = (message: string, severity: AlertColor) => {
    setToast({ open: true, message, severity });
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: "100vh" }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1.5,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(130deg, rgba(34,183,131,0.13) 0%, rgba(17,19,24,0.95) 65%, rgba(30,45,70,0.2) 100%)",
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            alignItems={{ xs: "stretch", lg: "center" }}
            gap={1.25}
          >
            <Box sx={{ mr: "auto" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
                Mermaid Pro Workbench
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Live editor with template presets, import/export tooling, and shareable links.
              </Typography>
            </Box>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip
                label={error ? "Render error" : isRendering ? "Rendering..." : "Ready"}
                color={error ? "error" : isRendering ? "warning" : "success"}
                size="small"
              />
              <Chip label={`${lineCount} lines`} size="small" variant="outlined" />
              <Chip label={`${charCount} chars`} size="small" variant="outlined" />
              {lastRenderedAt ? (
                <Chip label={`Updated ${lastRenderedAt}`} size="small" variant="outlined" />
              ) : null}
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", lg: "row" }} gap={1} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel id="template-label">Template</InputLabel>
              <Select
                labelId="template-label"
                value={templateId}
                label="Template"
                onChange={handleTemplateChange}
              >
                {DIAGRAM_TEMPLATES.map((item) => (
                  <MenuItem value={item.id} key={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="theme-label">Theme</InputLabel>
              <Select
                labelId="theme-label"
                value={theme}
                label="Theme"
                onChange={handleThemeChange}
              >
                {MERMAID_THEMES.map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="scale-label">Scale</InputLabel>
              <Select<number>
                labelId="scale-label"
                value={scale}
                label="Scale"
                onChange={handleScaleChange}
              >
                {SCALES.map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}x
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" onClick={handleExportPng} disabled={exportDisabled}>
              Export PNG
            </Button>
            <Button variant="outlined" onClick={handleExportSvg} disabled={exportDisabled}>
              Export SVG
            </Button>
            <Button variant="outlined" onClick={handleDownloadSource}>
              Download .mmd
            </Button>
            <Button variant="outlined" onClick={handleImportClick}>
              Import .mmd
            </Button>
            <Button variant="outlined" onClick={handleCopyCode}>
              Copy Code
            </Button>
            <Button variant="outlined" onClick={handleCopySvg} disabled={exportDisabled}>
              Copy SVG
            </Button>
            <Button variant="outlined" onClick={handleShare}>
              Share Link
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 1.5,
          minHeight: { xs: "70vh", lg: "calc(100vh - 280px)" },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 300,
          }}
        >
          <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2">Editor</Typography>
            <Typography variant="caption" color="text.secondary">
              Mermaid syntax with autosave enabled.
            </Typography>
          </Box>
          <Box
            component="textarea"
            aria-label="Mermaid code editor"
            spellCheck={false}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              if (templateId !== "custom") {
                setTemplateId("custom");
              }
            }}
            sx={{
              width: "100%",
              flex: 1,
              border: "none",
              p: 2,
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              backgroundColor: "background.paper",
              color: "text.primary",
            }}
          />
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2">Preview</Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time render with theme and export controls.
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: error ? "flex-start" : "center",
              overflow: "auto",
              flex: 1,
            }}
          >
            {error ? (
              <Alert severity="error" sx={{ width: "100%", whiteSpace: "pre-wrap" }}>
                {error}
              </Alert>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  "& svg": { maxWidth: "100%", height: "auto" },
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </Box>
        </Paper>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
        {templateId !== "custom"
          ? DIAGRAM_TEMPLATES.find((item) => item.id === templateId)?.description
          : "Custom diagram mode."}
      </Typography>

      <input
        ref={importFileRef}
        type="file"
        accept=".mmd,.mermaid,.txt"
        hidden
        onChange={handleImportSource}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function loadSvgImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load SVG image"));
    image.src = url;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create PNG blob"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

