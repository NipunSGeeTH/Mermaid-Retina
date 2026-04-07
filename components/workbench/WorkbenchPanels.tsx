import { Alert, Box, Paper, Typography } from "@mui/material";
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
              Mermaid syntax with autosave enabled.
            </Typography>
          </Box>
          <Box
            component="textarea"
            aria-label="Mermaid code editor"
            spellCheck={false}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
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
            <Typography variant="subtitle2">Preview</Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time render. Drag the middle bar on desktop to resize.
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
              background: previewBackground,
              backgroundSize: "20px 20px",
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
      ) : null}
    </Box>
  );
}
