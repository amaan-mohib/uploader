import React, { useState } from "react";
import QrReader from "react-qr-reader";
import {
  Dialog,
  DialogContent,
  Fab,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import { QrCodeScannerOutlined, Close } from "@mui/icons-material";
import socket, { ENDPOINT } from "../utils/socket";
import { useAuth } from "../context/AuthProvider";
import { browserName, OSName } from "../utils/format";
import axios from "axios";

const Scanner = () => {
  const { user } = useAuth();
  const [result, setResult] = useState("");
  const [open, setOpen] = useState(false);
  const handleScan = (data) => {
    if (data) {
      if (socket && data) {
        axios.get(`${ENDPOINT}user/${socket.id}`).then((res) => {
          axios.get(`${ENDPOINT}is-users/${data}`).then((res2) => {
            console.log(res);
            if (!res.data && res2.data) {
              socket.emit(
                "join",
                {
                  uuid: data,
                  user: {
                    sid: socket.id,
                    uid: user.uid,
                    host: false,
                    info: {
                      browserName: browserName(),
                      OSName: OSName(),
                      username: user.displayName,
                      time: new Date(Date.now()),
                    },
                  },
                },
                (error) => {
                  if (error) console.error(error);
                }
              );
              setResult(data);
            } else {
              setResult("Make sure the QR code is valid");
              if (res.data) {
                setResult("You are a host, disconnect first");
              }
              setTimeout(() => {
                setResult("");
              }, 3000);
            }
          });
        });
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
      <Dialog open={open} onClose={handleClose} fullScreen>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close">
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Scan
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent>
          {!result && (
            <div style={{ width: "256px" }}>
              <QrReader onScan={handleScan} onError={handleError} />
            </div>
          )}
          <p>{result}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scanner;
