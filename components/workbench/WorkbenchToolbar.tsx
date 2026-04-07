import { Button, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { MobilePanelMode, WorkbenchToolbarProps } from "@/components/workbench/types";

export default function WorkbenchToolbar({
  isDesktop,
  mobilePanelMode,
  canExport,
  onFormatCode,
  onShareLink,
  onOpenGraph,
  onOpenExport,
  onOpenTheme,
  onImportClick,
  onMobilePanelModeChange,
}: WorkbenchToolbarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1.5,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Mermaid Editor
        </Typography>
        <Stack direction="row" gap={1}>
          <Button variant="outlined" onClick={onFormatCode} title="Format Mermaid code (Shift + Alt + F)">
            Format
          </Button>
          <Button variant="outlined" onClick={onShareLink}>
            Share
          </Button>
          <Button variant="outlined" onClick={onOpenGraph}>
            Graph
          </Button>
          <Button variant="outlined" onClick={onImportClick}>
            Import
          </Button>
          <Button variant="outlined" onClick={onOpenTheme}>
            Theme
          </Button>
          <Button variant="contained" onClick={onOpenExport} disabled={!canExport}>
            Export
          </Button>
        </Stack>
      </Stack>

      {!isDesktop ? (
        <ToggleButtonGroup
          size="small"
          color="primary"
          value={mobilePanelMode}
          exclusive
          onChange={(_, nextMode: MobilePanelMode | null) => {
            if (nextMode) {
              onMobilePanelModeChange(nextMode);
            }
          }}
        >
          <ToggleButton value="split">Split</ToggleButton>
          <ToggleButton value="editor">Editor</ToggleButton>
          <ToggleButton value="preview">Preview</ToggleButton>
        </ToggleButtonGroup>
      ) : null}
    </Paper>
  );
}
