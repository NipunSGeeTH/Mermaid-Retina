import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { DIAGRAM_TEMPLATES } from "@/lib/diagramTemplates";
import { MERMAID_THEMES } from "@/lib/mermaidThemes";
import type { MobilePanelMode, WorkbenchToolbarProps } from "@/components/workbench/types";

export default function WorkbenchToolbar({
  error,
  isRendering,
  lineCount,
  charCount,
  lastRenderedAt,
  templateId,
  theme,
  scale,
  scales,
  exportDisabled,
  isDesktop,
  mobilePanelMode,
  onTemplateChange,
  onThemeChange,
  onScaleChange,
  onExportPng,
  onExportSvg,
  onDownloadSource,
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
              Smooth editing UX with draggable panels for better small-window viewing.
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
              onChange={onTemplateChange}
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
            <Select labelId="theme-label" value={theme} label="Theme" onChange={onThemeChange}>
              {MERMAID_THEMES.map((item) => (
                <MenuItem value={item} key={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="scale-label">Scale</InputLabel>
            <Select<number> labelId="scale-label" value={scale} label="Scale" onChange={onScaleChange}>
              {scales.map((item) => (
                <MenuItem value={item} key={item}>
                  {item}x
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={onExportPng} disabled={exportDisabled}>
            Export PNG
          </Button>
          <Button variant="outlined" onClick={onExportSvg} disabled={exportDisabled}>
            Export SVG
          </Button>
          <Button variant="outlined" onClick={onDownloadSource}>
            Download .mmd
          </Button>
          <Button variant="outlined" onClick={onImportClick}>
            Import .mmd
          </Button>
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
      </Stack>
    </Paper>
  );
}
