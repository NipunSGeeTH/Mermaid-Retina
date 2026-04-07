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
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import type { DiagramTemplate } from "@/lib/diagramTemplates";

type GraphTypeDialogProps = {
  open: boolean;
  templates: DiagramTemplate[];
  selectedTemplateId: string;
  onClose: () => void;
  onTemplateChange: (event: SelectChangeEvent<string>) => void;
  onApply: () => void;
};

export default function GraphTypeDialog({
  open,
  templates,
  selectedTemplateId,
  onClose,
  onTemplateChange,
  onApply,
}: GraphTypeDialogProps) {
  const selectedTemplate =
    templates.find((item) => item.id === selectedTemplateId) ?? templates[0];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Graph Type</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="graph-type-label">Type</InputLabel>
            <Select
              labelId="graph-type-label"
              value={selectedTemplateId}
              label="Type"
              onChange={onTemplateChange}
            >
              {templates.map((item) => (
                <MenuItem value={item.id} key={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            {selectedTemplate.description}
          </Typography>

          <Typography
            component="pre"
            sx={{
              p: 1.25,
              m: 0,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "background.default",
              fontFamily: "inherit",
              fontSize: "0.8rem",
              lineHeight: 1.45,
              whiteSpace: "pre-wrap",
              maxHeight: 220,
              overflow: "auto",
            }}
          >
            {selectedTemplate.code}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onApply}>
          Use Sample
        </Button>
      </DialogActions>
    </Dialog>
  );
}

