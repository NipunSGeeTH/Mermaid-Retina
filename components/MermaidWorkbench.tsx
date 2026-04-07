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
import * as resvg from "@resvg/resvg-wasm";

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
  const [wasmReady, setWasmReady] = useState<boolean>(false);
  const renderTokenRef = useRef<number>(0);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme });
  }, [theme]);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        await resvg.initWasm(
          fetch("https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.4.1/index_bg.wasm")
        );
        if (active) {
          setWasmReady(true);
        }
      } catch (wasmError) {
        console.error("WASM init failed", wasmError);
        if (active) {
          setWasmReady(false);
        }
      }
    };

    void init();

    return () => {
      active = false;
    };
  }, []);

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

  const exportDisabled = useMemo<boolean>(() => !svg || !wasmReady, [svg, wasmReady]);

  const handleExport = () => {
    if (!wasmReady || !svg) {
      return;
    }

    const renderer = new resvg.Resvg(svg, {
      fitTo: { mode: "zoom", value: scale },
    });

    const png = renderer.render().asPng();
    const blob = new Blob([Uint8Array.from(png)], { type: "image/png" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `diagram-${scale}x.png`;
    anchor.click();

    URL.revokeObjectURL(url);
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
