"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { MERMAID_THEMES, type MermaidTheme } from "@/lib/mermaidThemes";

const DEFAULT_CODE = `graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug it]
  D --> A`;

const SCALES = [1, 2, 4] as const;

export default function MermaidWorkbench() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [theme, setTheme] = useState<MermaidTheme>("dark");
  const [scale, setScale] = useState<number>(2);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const renderTokenRef = useRef<number>(0);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme });
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        const trimmed = code.trim();
        if (!trimmed) {
          setSvg("");
          setError("");
          return;
        }

        const token = ++renderTokenRef.current;

        try {
          const id = `mermaid-${token}`;
          const { svg: rendered } = await mermaid.render(id, trimmed);

          if (token !== renderTokenRef.current) {
            return;
          }

          setSvg(rendered);
          setError("");
        } catch (renderError: unknown) {
          if (token === renderTokenRef.current) {
            setSvg("");
            setError(
              renderError instanceof Error
                ? renderError.message
                : "Unknown Mermaid render error"
            );
          }
        }
      })();
    }, 300);

    return () => clearTimeout(timer);
  }, [code, theme]);

  const exportDisabled = useMemo<boolean>(() => !svg, [svg]);

  const handleExport = async () => {
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
      const pngUrl = URL.createObjectURL(pngBlob);

      const anchor = document.createElement("a");
      anchor.href = pngUrl;
      anchor.download = `diagram-${scale}x.png`;
      anchor.click();

      URL.revokeObjectURL(pngUrl);
    } catch (exportError) {
      console.error("PNG export failed", exportError);
      alert("PNG export failed. Please try again.");
    }
  };

  const handleThemeChange = (event: SelectChangeEvent<string>) => {
    setTheme(event.target.value as MermaidTheme);
  };

  const handleScaleChange = (event: SelectChangeEvent<number>) => {
    setScale(Number(event.target.value));
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: "100vh" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        gap={1.5}
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ mb: 1.5 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mr: "auto" }}>
          Mermaid Exporter
        </Typography>

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

        <Button variant="contained" onClick={handleExport} disabled={exportDisabled}>
          Export PNG
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 0,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          minHeight: { xs: "70vh", md: "calc(100vh - 120px)" },
          backgroundColor: "background.paper",
        }}
      >
        <Box
          component="textarea"
          aria-label="Mermaid code editor"
          spellCheck={false}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          sx={{
            width: "100%",
            border: "none",
            borderRight: { md: "1px solid" },
            borderBottom: { xs: "1px solid", md: "none" },
            borderColor: "divider",
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

        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "auto",
          }}
        >
          {error ? (
            <Typography color="error.main" sx={{ whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>
              {error}
            </Typography>
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
      </Box>
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
