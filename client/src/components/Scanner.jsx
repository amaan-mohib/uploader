import React, { useEffect, useState } from "react";
import QrReader from "react-qr-reader";
import {
  Dialog,
  DialogContent,
  Fab,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";
import {
  QrCodeScannerOutlined,
  Close,
  HomeOutlined,
} from "@mui/icons-material";
import socket, { ENDPOINT } from "../utils/socket";
import { useAuth } from "../context/AuthProvider";
import { browserName, OSName } from "../utils/format";
import axios from "axios";
import UploadComp from "./UploadComp";
import short from "short-uuid";
import { useNavigate, useParams } from "react-router-dom";

const Scanner = () => {
  const { user } = useAuth();
  const { scanId } = useParams();
  const [result, setResult] = useState("");
  const [connected, setConnected] = useState([0]);
  const [uuid, setUuid] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleScan = (url = "") => {
    if (url) {
      if (socket && url) {
        const translator = short();
        const data = translator.toUUID(url.split("/").pop());
        axios.get(`${ENDPOINT}user/${socket.id}`).then((res) => {
          axios.get(`${ENDPOINT}is-users/${data}`).then((res2) => {
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
              setUuid(data);
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
  const disconnect = () => {
    socket.disconnect();
    setUuid("");
    setResult("");
    setTimeout(() => {
      socket.connect();
      if (scanId) {
        navigate("/");
      } else {
        handleClose();
      }
    }, 1000);
  };

  useEffect(() => {
    if (scanId) {
      setOpen(true);
      setTimeout(() => {
        handleScan(window.location.href);
      }, 500);
    }
  }, []);

  useEffect(() => {
    socket.on("connected users", (users) => {
      setConnected(users.connected);
      if (users.connected.length === 0) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    });
  }, []);
  return (
    <div>
      <ListItem
        button
        onClick={() => {
          setOpen(true);
        }}>
        <ListItemIcon>
          <QrCodeScannerOutlined color="secondary" />
        </ListItemIcon>
        <ListItemText
          primary="Scan"
          primaryTypographyProps={{
            color: "secondary",
          }}
        />
      </ListItem>
      <Dialog open={open} onClose={handleClose} fullScreen>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            {!scanId ? (
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close">
                <Close />
              </IconButton>
            ) : (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  navigate("/");
                }}
                aria-label="close">
                <HomeOutlined />
              </IconButton>
            )}
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Scan
            </Typography>
            {uuid && (
              <Button color="inherit" onClick={disconnect}>
                Disconnect
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <DialogContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              margin: "auto",
            }}>
            {uuid ? (
              <UploadComp isScanner={true} uuid={uuid} />
            ) : (
              <div style={{ width: "256px" }}>
                <QrReader onScan={handleScan} onError={handleError} />
              </div>
            )}
            <p>{result === uuid ? "" : result}</p>
            {connected.length === 0 && (
              <p style={{ textAlign: "center" }}>
                Host ended the session.
                <br />
                Will disconnect in 3 seconds
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scanner;
