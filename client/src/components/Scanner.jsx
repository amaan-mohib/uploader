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
import socket from "../utils/socket";
import { useAuth } from "../context/AuthProvider";

const Scanner = () => {
  const { user } = useAuth();
  const [result, setResult] = useState("");
  const [open, setOpen] = useState(false);
  const handleScan = (data) => {
    if (data) {
      if (socket && data) {
        socket.emit(
          "join",
          {
            uuid: data,
            user: {
              sid: socket.id,
              uid: user.uid,
              host: false,
              info: navigator.userAgentData,
            },
          },
          (error) => {
            if (error) console.error(error);
          }
        );
        setResult(data);
      }
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
          {!result && <QrReader onScan={handleScan} onError={handleError} />}
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
