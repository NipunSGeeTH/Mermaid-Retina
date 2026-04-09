import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";

type ShareDialogProps = {
  open: boolean;
  shareUrl: string;
  isLongShareFallback?: boolean;
  onClose: () => void;
  onCopy: () => void;
  onDownloadCompressed?: () => void;
};

export default function ShareDialog({
  open,
  shareUrl,
  isLongShareFallback = false,
  onClose,
  onCopy,
  onDownloadCompressed,
}: ShareDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Share Diagram</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {isLongShareFallback ? (
            <Alert severity="warning">
              This diagram is too large for a reliable URL share on some mobile browsers. Download a
              compressed file and import it on the target device.
            </Alert>
          ) : null}
          <TextField
            label="Share URL"
            value={shareUrl}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            helperText={isLongShareFallback ? "URL fallback disabled for large diagram." : undefined}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onDownloadCompressed} disabled={!isLongShareFallback || !onDownloadCompressed}>
          Download Compressed
        </Button>
        <Button variant="contained" onClick={onCopy} disabled={!shareUrl}>
          Copy Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
