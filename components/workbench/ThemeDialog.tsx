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
  type SelectChangeEvent,
} from "@mui/material";
import { MERMAID_THEMES, type MermaidTheme } from "@/lib/mermaidThemes";
import type { AppMode } from "@/components/workbench/types";

type ThemeDialogProps = {
  open: boolean;
  theme: MermaidTheme;
  appMode: AppMode;
  onClose: () => void;
  onThemeChange: (event: SelectChangeEvent<string>) => void;
  onAppModeChange: (event: SelectChangeEvent<string>) => void;
};

export default function ThemeDialog({
  open,
  theme,
  appMode,
  onClose,
  onThemeChange,
  onAppModeChange,
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

          <FormControl size="small" fullWidth>
            <InputLabel id="app-mode-label">App Mode</InputLabel>
            <Select
              labelId="app-mode-label"
              value={appMode}
              label="App Mode"
              onChange={onAppModeChange}
            >
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="light">Light</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
