import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import { MERMAID_THEMES, type MermaidTheme } from "@/lib/mermaidThemes";
import type { SectionColors } from "@/components/workbench/types";

type ThemeDialogProps = {
  open: boolean;
  theme: MermaidTheme;
  sectionColors: SectionColors;
  onClose: () => void;
  onThemeChange: (event: SelectChangeEvent<string>) => void;
  onSectionColorChange: (key: keyof SectionColors, value: string) => void;
};

export default function ThemeDialog({
  open,
  theme,
  sectionColors,
  onClose,
  onThemeChange,
  onSectionColorChange,
}: ThemeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Theme & Colors</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="mermaid-theme-label">Mermaid Theme</InputLabel>
            <Select
              labelId="mermaid-theme-label"
              value={theme}
              label="Mermaid Theme"
              onChange={onThemeChange}
            >
              {MERMAID_THEMES.map((item) => (
                <MenuItem value={item} key={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Page Background"
            type="color"
            value={sectionColors.pageBackground}
            onChange={(event) => onSectionColorChange("pageBackground", event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            label="Editor Background"
            type="color"
            value={sectionColors.editorBackground}
            onChange={(event) => onSectionColorChange("editorBackground", event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            label="Editor Text"
            type="color"
            value={sectionColors.editorText}
            onChange={(event) => onSectionColorChange("editorText", event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            label="Preview Background"
            type="color"
            value={sectionColors.previewBackground}
            onChange={(event) => onSectionColorChange("previewBackground", event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

