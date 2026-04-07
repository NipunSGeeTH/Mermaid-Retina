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
import type { ExportType } from "@/components/workbench/types";

type ExportDialogProps = {
  open: boolean;
  exportType: ExportType;
  scale: number;
  scales: readonly number[];
  onClose: () => void;
  onExportTypeChange: (event: SelectChangeEvent<ExportType>) => void;
  onScaleChange: (event: SelectChangeEvent<number>) => void;
  onConfirm: () => void;
};

export default function ExportDialog({
  open,
  exportType,
  scale,
  scales,
  onClose,
  onExportTypeChange,
  onScaleChange,
  onConfirm,
}: ExportDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Export Diagram</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="export-type-label">Type</InputLabel>
            <Select<ExportType>
              labelId="export-type-label"
              value={exportType}
              label="Type"
              onChange={onExportTypeChange}
            >
              <MenuItem value="png">PNG Image</MenuItem>
              <MenuItem value="svg">SVG Vector</MenuItem>
              <MenuItem value="mmd">Mermaid Source (.mmd)</MenuItem>
            </Select>
          </FormControl>

          {exportType === "png" ? (
            <FormControl size="small" fullWidth>
              <InputLabel id="export-scale-label">Scale</InputLabel>
              <Select<number>
                labelId="export-scale-label"
                value={scale}
                label="Scale"
                onChange={onScaleChange}
              >
                {scales.map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}x
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm}>
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}

