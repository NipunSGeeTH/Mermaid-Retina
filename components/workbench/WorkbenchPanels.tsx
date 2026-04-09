import { useCallback, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { mermaid } from "codemirror-lang-mermaid";
import type { WorkbenchPanelsProps } from "@/components/workbench/types";

export default function WorkbenchPanels({
  isDesktop,
  splitRatio,
  isDraggingSplit,
  showEditorPanel,
  showPreviewPanel,
  code,
  error,
  svg,
  isRendering,
  previewBackground,
  graphBackgroundStyle,
  graphBackgroundImageWidth,
  graphBackgroundImageHeight,
  splitContainerRef,
  onCodeChange,
  onStartSplitDrag,
}: WorkbenchPanelsProps) {
  const muiTheme = useTheme();
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [showFullScreenTopBar, setShowFullScreenTopBar] = useState(true);
  const [viewport, setViewport] = useState({ x: 40, y: 40, zoom: 1 });
  const [isPanningPreview, setIsPanningPreview] = useState(false);
  const panOriginRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(
    null
  );
  const editorExtensions = useMemo(
    () => [mermaid(), keymap.of([indentWithTab])],
    []
  );
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;

  const getBackgroundSize = () => {
    if (graphBackgroundStyle === "image") {
      return `${graphBackgroundImageWidth}px ${graphBackgroundImageHeight}px`;
    }
    return "20px 20px"; // Default for grids and patterns
  };

  const desktopPreviewContent = (
    <Box
      sx={{
        width: "max-content",
        "& svg": {
          display: "block",
          width: "auto",
          height: "auto",
          maxWidth: "none",
          maxHeight: "none",
        },
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );

  const mobilePreviewContent = (
    <Box
      sx={{
        width: "100%",
        "& svg": {
          display: "block",
          width: "100%",
          height: "auto",
          maxWidth: "100%",
        },
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );

  const stopPreviewPanning = useCallback(() => {
    setIsPanningPreview(false);
    panOriginRef.current = null;
  }, []);

  const handlePreviewPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (error) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      panOriginRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - viewport.x,
        offsetY: event.clientY - viewport.y,
      };
      setIsPanningPreview(true);
    },
    [error, viewport.x, viewport.y]
  );

  const handlePreviewPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const origin = panOriginRef.current;
    if (!origin || origin.pointerId !== event.pointerId) return;
    setViewport((prev) => ({
      ...prev,
      x: event.clientX - origin.offsetX,
      y: event.clientY - origin.offsetY,
    }));
  }, []);

  const handlePreviewPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        stopPreviewPanning();
        return;
      }
      event.currentTarget.releasePointerCapture(event.pointerId);
      stopPreviewPanning();
    },
    [stopPreviewPanning]
  );

  const handlePreviewWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (error) return;
      event.preventDefault();

      const rect = event.currentTarget.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const zoomDelta = -event.deltaY * 0.0015;
      const zoomFactor = Math.exp(zoomDelta);

      setViewport((prev) => {
        const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom * zoomFactor));
        const worldX = (pointerX - prev.x) / prev.zoom;
        const worldY = (pointerY - prev.y) / prev.zoom;
        return {
          zoom: nextZoom,
          x: pointerX - worldX * nextZoom,
          y: pointerY - worldY * nextZoom,
        };
      });
    },
    [error]
  );

  const resetPreviewViewport = useCallback(() => {
    setViewport({ x: 40, y: 40, zoom: 1 });
    stopPreviewPanning();
  }, [stopPreviewPanning]);

  const previewViewportContent = error ? (
    <Box
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        overflow: "auto",
        height: "100%",
        background: previewBackground,
        backgroundSize: getBackgroundSize(),
      }}
    >
      <Alert severity="error" sx={{ width: "100%", whiteSpace: "pre-wrap" }}>
        {error}
      </Alert>
    </Box>
  ) : !svg.trim() ? (
    <Box
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "auto",
        height: "100%",
        background: previewBackground,
        backgroundSize: getBackgroundSize(),
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          width: "100%",
          maxWidth: 420,
          border: "1px solid",
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        {isRendering ? (
          <Stack spacing={1.25} alignItems="center">
            <CircularProgress size={22} />
            <Typography variant="body2" color="text.secondary">
              Rendering graph...
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Enter Mermaid code to preview your graph.
          </Typography>
        )}
      </Paper>
    </Box>
  ) : !isDesktop ? (
    <Box
      sx={{
        p: 2,
        overflow: "auto",
        flex: 1,
        minHeight: 0,
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          p: 2,
          background: previewBackground,
          backgroundSize: getBackgroundSize(),
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        {mobilePreviewContent}
      </Box>
    </Box>
  ) : (
    <Box
      onPointerDown={handlePreviewPointerDown}
      onPointerMove={handlePreviewPointerMove}
      onPointerUp={handlePreviewPointerUp}
      onPointerCancel={stopPreviewPanning}
      onPointerLeave={handlePreviewPointerUp}
      onWheel={handlePreviewWheel}
      sx={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        cursor: isPanningPreview ? "grabbing" : "grab",
        touchAction: "none",
        backgroundColor: "background.default",
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        <Box
          sx={{
            p: 2,
            width: "max-content",
            background: previewBackground,
            backgroundSize: getBackgroundSize(),
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          {desktopPreviewContent}
        </Box>
      </Box>
    </Box>
  );

  const mobileGridRows = showEditorPanel && showPreviewPanel
    ? "minmax(0, 1fr) minmax(0, 1fr)"
    : "minmax(0, 1fr)";

  return (
    <Box
      ref={splitContainerRef}
      sx={{
        display: "grid",
        gridTemplateColumns: isDesktop ? `${splitRatio}fr 10px ${100 - splitRatio}fr` : "1fr",
        gridTemplateRows: isDesktop ? "1fr" : mobileGridRows,
        gap: isDesktop ? 0 : 1.5,
        height: "100%",
        minHeight: 0,
      }}
    >
      {showEditorPanel ? (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2">Editor</Typography>
            <Typography variant="caption" color="text.secondary">
              Mermaid syntax with autosave. Use Tab for indent.
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              backgroundColor: "background.paper",
              overflow: "hidden",
              "& .cm-editor": {
                height: "100%",
                outline: "none",
                backgroundColor: "background.paper",
                color: "text.primary",
                fontFamily:
                  "'JetBrains Mono', 'Fira Code', 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
                fontSize: "0.92rem",
              },
              "& .cm-cursor, & .cm-dropCursor": {
                borderLeftColor: "primary.main",
              },
              "& .cm-scroller": {
                overflow: "auto",
                lineHeight: 1.7,
              },
              "& .cm-content": {
                paddingBlock: "4px",
              },
              "& .cm-selectionBackground, & .cm-content ::selection": {
                backgroundColor: "action.selected",
              },
              "& .cm-gutters": {
                backgroundColor: "background.default",
                borderRight: "1px solid",
                borderColor: "divider",
                color: "text.secondary",
              },
              "& .cm-activeLine, & .cm-activeLineGutter": {
                backgroundColor: "action.hover",
              },
              "& .cm-focused": {
                outline: "none",
              },
            }}
          >
            <CodeMirror
              value={code}
              height="100%"
              theme={muiTheme.palette.mode}
              extensions={editorExtensions}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: true,
                bracketMatching: true,
                autocompletion: true,
              }}
              onChange={onCodeChange}
            />
          </Box>
        </Paper>
      ) : null}

      {isDesktop ? (
        <Box
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor and preview"
          onPointerDown={onStartSplitDrag}
          sx={{
            cursor: "col-resize",
            position: "relative",
            backgroundColor: isDraggingSplit ? "primary.main" : "transparent",
            transition: "background-color 120ms ease",
            "&::after": {
              content: "\"\"",
              position: "absolute",
              inset: "10px 3px",
              borderRadius: 99,
              backgroundColor: "divider",
            },
          }}
        />
      ) : null}

      {showPreviewPanel ? (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              <Box>
                <Typography variant="subtitle2">Preview</Typography>
                <Typography variant="caption" color="text.secondary">
                  {isRendering
                    ? "Rendering graph..."
                    : "Real-time render. Drag to pan and scroll to zoom in/out."}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={resetPreviewViewport}>
                  Reset View
                </Button>
                <Button size="small" variant="outlined" onClick={() => setFullScreenOpen(true)}>
                  Full Screen
                </Button>
              </Stack>
            </Stack>
          </Box>
          {previewViewportContent}
        </Paper>
      ) : null}

      <Dialog open={fullScreenOpen} onClose={() => setFullScreenOpen(false)} fullScreen>
        <Box
          sx={{ position: "relative", height: "100%", width: "100%" }}
          onMouseMove={(event) => {
            setShowFullScreenTopBar(event.clientY <= 88);
          }}
          onMouseLeave={() => setShowFullScreenTopBar(false)}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 2,
              p: 1.5,
              opacity: showFullScreenTopBar ? 1 : 0,
              transform: showFullScreenTopBar ? "translateY(0)" : "translateY(-8px)",
              transition: "opacity 180ms ease, transform 180ms ease",
              pointerEvents: showFullScreenTopBar ? "auto" : "none",
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.2) 60%, rgba(15,23,42,0) 100%)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="common.white">
                Graph Preview
              </Typography>
              <Button onClick={() => setFullScreenOpen(false)} variant="contained" size="small">
                Close
              </Button>
            </Stack>
          </Box>

          <DialogContent sx={{ p: 0, height: "100%" }}>{previewViewportContent}</DialogContent>
        </Box>
      </Dialog>
    </Box>
  );
}
