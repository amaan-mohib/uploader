import React, { useState } from "react";
import QrReader from "react-qr-reader";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
} from "@mui/material";
import { QrCodeScannerOutlined } from "@mui/icons-material";

const Scanner = () => {
  const [result, setResult] = useState("No result");
  const [open, setOpen] = useState(false);
  const handleScan = (data) => {
    if (data) {
      setResult(data);
    }
  };
  const handleError = (err) => {
    console.error(err);
  };
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
        <QrCodeScannerOutlined sx={{ mr: 1 }} />
        Scan
      </Fab>
      <Fab
        className="fab-m"
        onClick={() => {
          setOpen(true);
        }}>
        <QrCodeScannerOutlined />
      </Fab>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload</DialogTitle>
        <DialogContent>
          <QrReader onScan={handleScan} onError={handleError} />
          <p>{result}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Scanner;
