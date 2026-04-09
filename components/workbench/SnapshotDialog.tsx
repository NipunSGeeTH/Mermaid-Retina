import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import type { SnapshotItem } from "@/components/workbench/types";

type SnapshotDialogProps = {
  open: boolean;
  snapshots: SnapshotItem[];
  onClose: () => void;
  onRestore: (snapshotId: string) => void;
  onCreateManual: () => void;
};

function formatSnapshotTime(ts: number): string {
  return new Date(ts).toLocaleString();
}

export default function SnapshotDialog({
  open,
  snapshots,
  onClose,
  onRestore,
  onCreateManual,
}: SnapshotDialogProps) {
  const ordered = [...snapshots].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Restore Points</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Snapshots are captured automatically as you edit. You can create a manual restore point any
            time.
          </Typography>
          <Button variant="outlined" size="small" onClick={onCreateManual}>
            Create Snapshot Now
          </Button>
          {ordered.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No snapshots yet.
            </Typography>
          ) : (
            <List disablePadding>
              {ordered.map((snapshot) => (
                <ListItem
                  key={snapshot.id}
                  divider
                  secondaryAction={
                    <Button size="small" variant="contained" onClick={() => onRestore(snapshot.id)}>
                      Restore
                    </Button>
                  }
                >
                  <ListItemText
                    primary={formatSnapshotTime(snapshot.createdAt)}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={snapshot.reason === "auto" ? "Auto" : "Manual"}
                          color={snapshot.reason === "auto" ? "default" : "primary"}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {snapshot.code.slice(0, 80).replace(/\s+/g, " ") || "(empty)"}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
