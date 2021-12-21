import { Add, Close, Web } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Dialog,
  DialogContent,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
} from "@mui/material";
import Qrcode from "qrcode.react";
import { useEffect, useState } from "react";
import short from "short-uuid";
import { useAuth } from "../context/AuthProvider";
import { browserName, months, OSName } from "../utils/format";
import socket from "../utils/socket";
import Scanner from "./Scanner";
import UploadComp from "./UploadComp";

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
    }
  }, [socket, uuid, isQr]);
  return (
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
            Upload
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <div className="dialog-content">
          <div className="qr-content">
            <h2>Scan QR</h2>
            <div className="qr">
              <Qrcode value={uuid} size={125} />
            </div>
            <ConnectedUsers />
          </div>
          <Divider orientation="vertical" flexItem>
            OR
          </Divider>
          <div className="upload-content">
            <UploadComp />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ConnectedUsers = () => {
  const [connected, setConnected] = useState([]);

  useEffect(() => {
    socket.on("connected users", (users) => {
      setConnected(users.connected);
      console.log(users.connected);
    });
  }, []);
  return (
    <div className="device-list">
      {connected.length > 0 && (
        <List subheader={<ListSubheader>Connected devices</ListSubheader>}>
          {connected.map((device) => (
            <DeviceList key={device.info.sid} device={device.info} />
          ))}
        </List>
      )}
    </div>
  );
};

const DeviceList = ({ device }) => {
  let time = new Date(device.time);
  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar>
          <Web />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={`${device.browserName} (${device.OSName})`}
        secondary={`${device.username} • Connected at ${time.getDate()} ${
          months[time.getMonth()]
        }, ${time.getHours()}:${time.getMinutes()}`}
      />
    </ListItem>
  );
};

export default Upload;
