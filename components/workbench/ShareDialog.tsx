import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";

type ShareDialogProps = {
  open: boolean;
  shareUrl: string;
  onClose: () => void;
  onCopy: () => void;
};

export default function ShareDialog({ open, shareUrl, onClose, onCopy }: ShareDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Share Diagram</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label="Share URL"
            value={shareUrl}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onCopy} disabled={!shareUrl}>
          Copy Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
