import {
  Button,
  Box,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
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
  onDeleteDraft,
  onShareLink,
  onOpenGraph,
  onOpenExport,
  onOpenTheme,
  onImportClick,
  onMobilePanelModeChange,
}: WorkbenchToolbarProps) {
  const NEW_DRAFT_TAB_VALUE = "__new_draft__";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        mb: 1,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Mermaid Editor
        </Typography>
        <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
          <Button size="small" variant="outlined" onClick={onShareLink}>
            Share
          </Button>
          <Button size="small" variant="outlined" onClick={onOpenGraph}>
            Graph
          </Button>
          <Button size="small" variant="outlined" onClick={onImportClick}>
            Import
          </Button>
          <Button size="small" variant="outlined" onClick={onOpenTheme}>
            Theme
          </Button>
          <Button size="small" variant="contained" onClick={onOpenExport} disabled={!canExport}>
            Export
          </Button>
        </Stack>
      </Stack>

      <Tabs
        value={activeDraftId}
        onChange={(_, nextDraftId: string) => {
          if (nextDraftId === NEW_DRAFT_TAB_VALUE) {
            onCreateDraft();
            return;
          }
          onSelectDraft(nextDraftId);
        }}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Draft tabs"
        sx={{ minHeight: 34, "& .MuiTab-root": { minHeight: 34, py: 0.25, px: 0.75 } }}
      >
        {drafts.map((draft) => (
          <Tab
            key={draft.id}
            value={draft.id}
            label={
              <Stack direction="row" alignItems="center" gap={0.5}>
                <span>{draft.name}</span>
                <Tooltip title="Delete Draft">
                  <span>
                    <Box
                      component="span"
                      role="button"
                      aria-label={`Delete ${draft.name}`}
                      tabIndex={drafts.length <= 1 ? -1 : 0}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (drafts.length > 1) {
                          onDeleteDraft(draft.id);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (drafts.length <= 1) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          onDeleteDraft(draft.id);
                        }
                      }}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        fontSize: "0.85rem",
                        lineHeight: 1,
                        cursor: drafts.length <= 1 ? "not-allowed" : "pointer",
                        opacity: drafts.length <= 1 ? 0.35 : 0.8,
                        "&:hover": {
                          backgroundColor: drafts.length <= 1 ? "transparent" : "action.hover",
                          opacity: drafts.length <= 1 ? 0.35 : 1,
                        },
                      }}
                    >
                      ×
                    </Box>
                  </span>
                </Tooltip>
              </Stack>
            }
          />
        ))}
        <Tab
          value={NEW_DRAFT_TAB_VALUE}
          aria-label="New draft"
          label={
            <Tooltip title="New Draft">
              <span style={{ fontWeight: 700 }}>+</span>
            </Tooltip>
          }
        />
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
