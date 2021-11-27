import { Add } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
} from "@mui/material";
import Qrcode from "qrcode.react";
import { useEffect, useState } from "react";
import short from "short-uuid";

const Upload = () => {
  const [open, setOpen] = useState(false);

  const [uuid, setUuid] = useState("");
  useEffect(() => {
    // const translator=short();
    const newUuid = short.uuid();
    setUuid(newUuid);
  }, []);
  const handleClose = () => {
    setOpen(!open);
  };
  return (
    <div>
      <Fab
        className="fab"
        variant="extended"
        onClick={() => {
          setOpen(true);
        }}>
        <Add sx={{ mr: 1 }} />
        Upload
      </Fab>
      <Fab
        className="fab-m"
        onClick={() => {
          setOpen(true);
        }}>
        <Add />
      </Fab>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload</DialogTitle>
        <DialogContent>
          <Qrcode value={uuid} size={256} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Upload;
