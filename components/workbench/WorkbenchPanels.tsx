import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { Alert, Box, Button, Dialog, DialogContent, Paper, Stack, Typography } from "@mui/material";
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
  previewBackground,
  splitContainerRef,
  onCodeChange,
  onStartSplitDrag,
}: WorkbenchPanelsProps) {
  const muiTheme = useTheme();
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [showFullScreenTopBar, setShowFullScreenTopBar] = useState(true);
  const editorExtensions = useMemo(
    () => [mermaid(), keymap.of([indentWithTab])],
    []
  );

  const previewContent = error ? (
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
  );

  return (
    <Box
      ref={splitContainerRef}
      sx={{
        display: "grid",
        gridTemplateColumns: isDesktop ? `${splitRatio}fr 10px ${100 - splitRatio}fr` : "1fr",
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
                paddingBlock: 10,
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
                  Real-time render. Drag the middle bar on desktop to resize.
                </Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={() => setFullScreenOpen(true)}>
                Full Screen
              </Button>
            </Stack>
          </Box>
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: error ? "flex-start" : "center",
              overflow: "auto",
              flex: 1,
              background: previewBackground,
              backgroundSize: "20px 20px",
            }}
          >
            {previewContent}
          </Box>
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

          <DialogContent
            sx={{
              p: 2,
              height: "100%",
              background: previewBackground,
              backgroundSize: "20px 20px",
              display: "flex",
              justifyContent: "center",
              alignItems: error ? "flex-start" : "center",
              overflow: "auto",
            }}
          >
            {previewContent}
          </DialogContent>
        </Box>
      </Dialog>
    </Box>
  );
}
