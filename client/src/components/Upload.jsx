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
import { useAuth } from "../context/AuthProvider";
import socket from "../utils/socket";
import Scanner from "./Scanner";

const Upload = () => {
  const [open, setOpen] = useState(false);
  const [webCam, setWebCam] = useState(false);
  const [isQr, setQr] = useState(false);
  const [uuid, setUuid] = useState("");
  useEffect(() => {
    const detectWebcam = (callback) => {
      let md = navigator.mediaDevices;
      if (!md || !md.enumerateDevices) return callback(false);
      md.enumerateDevices().then((devices) => {
        callback(devices.some((device) => "videoinput" === device.kind));
      });
    };
    detectWebcam((hasWebCam) => {
      setWebCam(hasWebCam);
    });
    // const translator=short();
    const newUuid = short.uuid();
    setUuid(newUuid);
  }, []);

  const handleClose = () => {
    setOpen(!open);
  };
  const handleOpen = () => {
    setOpen(true);
    setQr(true);
  };

  return (
    <div>
      <Fab
        className="fab"
        variant="extended"
        color="primary"
        onClick={handleOpen}>
        <Add sx={{ mr: 1 }} />
        Upload
      </Fab>
      <Fab className="fab-m" color="primary" onClick={handleOpen}>
        <Add />
      </Fab>
      {webCam && <Scanner />}
      <QRDialog open={open} uuid={uuid} handleClose={handleClose} isQr={isQr} />
    </div>
  );
};

const QRDialog = ({
  open = false,
  handleClose = () => {},
  uuid = "",
  isQr = false,
}) => {
  const { user } = useAuth();
  useEffect(() => {
    if (socket && uuid && isQr) {
      console.log(socket.id);
      socket.emit(
        "join",
        {
          uuid,
          user: {
            sid: socket.id,
            uid: user.uid,
            host: true,
            info: navigator.userAgentData,
          },
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [socket, uuid, isQr]);
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Upload</DialogTitle>
      <DialogContent>
        <Qrcode value={uuid} size={256} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Upload;
