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
  Slider,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { MERMAID_THEMES, type MermaidTheme } from "@/lib/mermaidThemes";
import { GRAPH_BACKGROUND_OPTIONS } from "@/components/workbench/graphBackground";
import { APP_THEME_OPTIONS } from "@/components/workbench/themePresets";
import type { AppMode, AppThemeName, GraphBackgroundStyle } from "@/components/workbench/types";

type ThemeDialogProps = {
  open: boolean;
  theme: MermaidTheme;
  appMode: AppMode;
  appTheme: AppThemeName;
  graphBackgroundStyle: GraphBackgroundStyle;
  graphBackgroundColor: string;
  graphBackgroundImage?: string;
  graphBackgroundImageWidth: number;
  graphBackgroundImageHeight: number;
  onClose: () => void;
  onThemeChange: (event: SelectChangeEvent<string>) => void;
  onAppModeChange: (event: SelectChangeEvent<string>) => void;
  onAppThemeChange: (event: SelectChangeEvent<string>) => void;
  onGraphBackgroundStyleChange: (event: SelectChangeEvent<string>) => void;
  onGraphBackgroundColorChange: (value: string) => void;
  onGraphBackgroundImageChange?: (imageData: string) => void;
  onGraphBackgroundImageWidthChange?: (value: number) => void;
  onGraphBackgroundImageHeightChange?: (value: number) => void;
};

export default function ThemeDialog({
  open,
  theme,
  appMode,
  appTheme,
  graphBackgroundStyle,
  graphBackgroundColor,
  graphBackgroundImage,
  graphBackgroundImageWidth,
  graphBackgroundImageHeight,
  onClose,
  onThemeChange,
  onAppModeChange,
  onAppThemeChange,
  onGraphBackgroundStyleChange,
  onGraphBackgroundColorChange,
  onGraphBackgroundImageChange,
  onGraphBackgroundImageWidthChange,
  onGraphBackgroundImageHeightChange,
}: ThemeDialogProps) {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onGraphBackgroundImageChange) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onGraphBackgroundImageChange(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

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

          <FormControl size="small" fullWidth>
            <InputLabel id="app-theme-label">Main Theme</InputLabel>
            <Select
              labelId="app-theme-label"
              value={appTheme}
              label="Main Theme"
              onChange={onAppThemeChange}
            >
              {APP_THEME_OPTIONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel id="graph-bg-style-label">Graph Background</InputLabel>
            <Select
              labelId="graph-bg-style-label"
              value={graphBackgroundStyle}
              label="Graph Background"
              onChange={onGraphBackgroundStyleChange}
            >
              {GRAPH_BACKGROUND_OPTIONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(graphBackgroundStyle === "custom" || graphBackgroundStyle === "solid") ? (
            <TextField
              size="small"
              label="Background Color"
              type="color"
              value={graphBackgroundColor}
              onChange={(event) => onGraphBackgroundColorChange(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          ) : null}

          {graphBackgroundStyle === "image" ? (
            <>
              <Button
                variant="outlined"
                component="label"
                size="small"
              >
                {graphBackgroundImage ? "Change Image" : "Upload Image"}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              {graphBackgroundImage && (
                <>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Width: {graphBackgroundImageWidth}px</Typography>
                    </Stack>
                    <Slider
                      min={100}
                      max={5000}
                      step={10}
                      value={graphBackgroundImageWidth}
                      onChange={(_, value) =>
                        onGraphBackgroundImageWidthChange?.(value as number)
                      }
                      sx={{ width: "100%" }}
                    />
                  </Stack>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Height: {graphBackgroundImageHeight}px</Typography>
                    </Stack>
                    <Slider
                      min={100}
                      max={5000}
                      step={10}
                      value={graphBackgroundImageHeight}
                      onChange={(_, value) =>
                        onGraphBackgroundImageHeightChange?.(value as number)
                      }
                      sx={{ width: "100%" }}
                    />
                  </Stack>
                </>
              )}
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
