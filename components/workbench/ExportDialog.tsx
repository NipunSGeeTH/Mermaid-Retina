import {
  Checkbox,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
  exportTransparent: boolean;
  pdfSize: string;
  scale: number;
  scales: readonly number[];
  onClose: () => void;
  onExportTypeChange: (event: SelectChangeEvent<ExportType>) => void;
  onExportTransparentChange: (checked: boolean) => void;
  onPdfSizeChange: (event: SelectChangeEvent<string>) => void;
  onScaleChange: (event: SelectChangeEvent<number>) => void;
  onConfirm: () => void;
};

export default function ExportDialog({
  open,
  exportType,
  exportTransparent,
  pdfSize,
  scale,
  scales,
  onClose,
  onExportTypeChange,
  onExportTransparentChange,
  onPdfSizeChange,
  onScaleChange,
  onConfirm,
}: ExportDialogProps) {
  const isImageExport = exportType === "png" || exportType === "jpg";
  const isPdfExport = exportType === "pdf";

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
              <MenuItem value="jpg">JPG Image</MenuItem>
              <MenuItem value="pdf">PDF Document</MenuItem>
              <MenuItem value="svg">SVG Vector</MenuItem>
              <MenuItem value="mmd">Mermaid Source (.mmd)</MenuItem>
            </Select>
          </FormControl>

          {isImageExport ? (
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

          {isPdfExport ? (
            <FormControl size="small" fullWidth>
              <InputLabel id="pdf-size-label">PDF Size</InputLabel>
              <Select
                labelId="pdf-size-label"
                value={pdfSize}
                label="PDF Size"
                onChange={onPdfSizeChange}
              >
                <MenuItem value="a4">A4</MenuItem>
                <MenuItem value="letter">Letter</MenuItem>
                <MenuItem value="legal">Legal</MenuItem>
                <MenuItem value="a3">A3</MenuItem>
              </Select>
            </FormControl>
          ) : null}

          {isImageExport ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportTransparent}
                  onChange={(_, checked) => onExportTransparentChange(checked)}
                  disabled={exportType === "jpg"}
                />
              }
              label="Transparent background"
            />
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
