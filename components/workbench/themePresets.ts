import { createTheme } from "@mui/material";
import type { AccessibilityMode, AppMode, AppThemeName } from "@/components/workbench/types";

type ModePalette = {
  primaryMain: string;
  backgroundDefault: string;
  backgroundPaper: string;
};

type ThemePreset = {
  label: string;
  light: ModePalette;
  dark: ModePalette;
};

const PRESETS: Record<AppThemeName, ThemePreset> = {
  classic: {
    label: "Classic",
    light: { primaryMain: "#1976d2", backgroundDefault: "#f4f6f8", backgroundPaper: "#ffffff" },
    dark: { primaryMain: "#60a5fa", backgroundDefault: "#0f172a", backgroundPaper: "#111827" },
  },
  ocean: {
    label: "Ocean",
    light: { primaryMain: "#0284c7", backgroundDefault: "#f0f9ff", backgroundPaper: "#ffffff" },
    dark: { primaryMain: "#38bdf8", backgroundDefault: "#082032", backgroundPaper: "#0b2942" },
  },
  forest: {
    label: "Forest",
    light: { primaryMain: "#2f855a", backgroundDefault: "#f4fbf7", backgroundPaper: "#ffffff" },
    dark: { primaryMain: "#34d399", backgroundDefault: "#102a1f", backgroundPaper: "#17372a" },
  },
  sunset: {
    label: "Sunset",
    light: { primaryMain: "#ea580c", backgroundDefault: "#fff7ed", backgroundPaper: "#ffffff" },
    dark: { primaryMain: "#fb923c", backgroundDefault: "#2b1a10", backgroundPaper: "#332015" },
  },
};

export const APP_THEME_OPTIONS = Object.entries(PRESETS).map(([value, preset]) => ({
  value: value as AppThemeName,
  label: preset.label,
}));

export function buildWorkbenchTheme(
  appTheme: AppThemeName,
  appMode: AppMode,
  accessibilityMode: AccessibilityMode
) {
  const preset = PRESETS[appTheme][appMode];
  const isHighContrast = accessibilityMode === "high-contrast";
  const isEnhanced = accessibilityMode === "enhanced" || isHighContrast;
  return createTheme({
    palette: {
      mode: appMode,
      primary: { main: preset.primaryMain },
      background: {
        default: preset.backgroundDefault,
        paper: preset.backgroundPaper,
      },
      contrastThreshold: isHighContrast ? 7 : 3,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily:
        "\"Fira Code\", \"JetBrains Mono\", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: isHighContrast ? 18 : isEnhanced ? 16 : 14,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "*:focus-visible": {
            outline: isHighContrast ? "3px solid #ffbf47" : "2px solid #60a5fa",
            outlineOffset: "2px",
          },
        },
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: isHighContrast,
        },
      },
    },
  });
}
