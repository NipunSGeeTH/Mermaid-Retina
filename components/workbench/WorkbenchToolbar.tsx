import {
  Button,
  Paper,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { MobilePanelMode, WorkbenchToolbarProps } from "@/components/workbench/types";

export default function WorkbenchToolbar({
  isDesktop,
  mobilePanelMode,
  canExport,
  drafts,
  activeDraftId,
  onSelectDraft,
  onCreateDraft,
  onRenameDraft,
  onDeleteDraft,
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
          <Button variant="outlined" onClick={onCreateDraft}>
            New Draft
          </Button>
          <Button variant="outlined" onClick={onRenameDraft} disabled={!drafts.length}>
            Rename
          </Button>
          <Button variant="outlined" onClick={onDeleteDraft} disabled={drafts.length <= 1}>
            Delete
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

      <Tabs
        value={activeDraftId}
        onChange={(_, nextDraftId: string) => onSelectDraft(nextDraftId)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Draft tabs"
      >
        {drafts.map((draft) => (
          <Tab key={draft.id} value={draft.id} label={draft.name} />
        ))}
      </Tabs>

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
