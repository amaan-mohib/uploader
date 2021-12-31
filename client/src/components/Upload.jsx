import {
  Add,
  Close,
  CloudDownloadOutlined,
  CreateNewFolderOutlined,
  FileDownloadOutlined,
  FolderOutlined,
  FolderSharedOutlined,
  MoreVertOutlined,
  UploadFileOutlined,
  Web,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Dialog,
  DialogContent,
  Divider,
  Link as MuiLink,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  MenuList,
  Toolbar,
  Typography,
  ListItemButton,
} from "@mui/material";
import axios from "axios";
import { serverTimestamp, setDoc } from "firebase/firestore";
import Qrcode from "qrcode.react";
import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import short from "short-uuid";
import { useAuth } from "../context/AuthProvider";
import { useFolder } from "../context/FolderProvider";
import { createDocRef } from "../utils/firebase";
import { browserName, formatSize, months, OSName } from "../utils/format";
import socket, { ENDPOINT } from "../utils/socket";
import NewFolder from "./NewFolder";
import Scanner from "./Scanner";
import UploadComp, { FileIcons } from "./UploadComp";

const Upload = () => {
  const [open, setOpen] = useState(false);
  const [webCam, setWebCam] = useState(false);
  const navigate = useNavigate();
  const [isQr, setQr] = useState(false);
  const [uuid, setUuid] = useState("");
  const [recievedFiles, setRecFiles] = useState([]);
  const [connected, setConnected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const [newFolder, setNewFolder] = useState(false);
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
    handleMenuClose();
  };

  return (
    <div style={{ paddingTop: "12px" }}>
      <List>
        <ListItem
          button
          id="demo-positioned-button"
          aria-controls="demo-positioned-menu"
          aria-haspopup="true"
          aria-expanded={menuOpen ? "true" : undefined}
          onClick={handleMenu}>
          <ListItemIcon>
            <Add color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="New"
            primaryTypographyProps={{
              color: "primary",
              fontWeight: "medium",
            }}
          />
        </ListItem>
        <Menu
          id="demo-positioned-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}>
          <MenuList dense>
            <MenuItem
              onClick={() => {
                setNewFolder(true);
                handleMenuClose();
              }}>
              <ListItemIcon>
                <CreateNewFolderOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add new folder</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleOpen}>
              <ListItemIcon>
                <UploadFileOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add new file</ListItemText>
            </MenuItem>
          </MenuList>
        </Menu>
        <NewFolder
          open={newFolder}
          handleClose={() => {
            setNewFolder(false);
          }}
        />
        {webCam && <Scanner />}
      </List>
      <Divider />
      <ListItemButton
        onClick={() => {
          navigate("/folder/shared");
        }}>
        <ListItemIcon>
          <FolderSharedOutlined />
        </ListItemIcon>
        <ListItemText primary="Shared" />
      </ListItemButton>
      <QRDialog
        open={open}
        uuid={uuid}
        handleClose={handleClose}
        isQr={isQr}
        recievedFiles={recievedFiles}
        setRecFiles={setRecFiles}
        connected={connected}
        setConnected={setConnected}
      />
    </div>
  );
};

const QRDialog = ({
  open = false,
  handleClose = () => {},
  uuid = "",
  isQr = false,
  recievedFiles = [],
  setRecFiles = () => {},
  connected = [],
  setConnected = () => {},
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
            <RecievedFiles
              files={recievedFiles}
              setFiles={setRecFiles}
              handleCloseD={handleClose}
            />
            <ConnectedUsers connected={connected} setConnected={setConnected} />
          </div>
          <Divider orientation="vertical" flexItem>
            OR
          </Divider>
          <UploadComp />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ConnectedUsers = ({ connected, setConnected }) => {
  useEffect(() => {
    socket.on("connected users", (users) => {
      setConnected(users.connected.filter((user) => user.sid !== socket.id));
      // console.log(users.connected);
    });
  }, []);
  return (
    <div className="device-list">
      {connected.length > 0 && (
        <List subheader={<ListSubheader>Connected devices</ListSubheader>}>
          {connected.map((device) => (
            <Fragment key={device.sid}>
              <DeviceList device={device.info} />
            </Fragment>
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

const RecievedFiles = ({ files = [], setFiles, handleCloseD }) => {
  useEffect(() => {
    socket.on("recieve files", (file) => {
      setFiles((f) => [...f, file]);
    });
  }, []);

  return (
    files.length > 0 && (
      <List
        subheader={<ListSubheader>Recieved Files</ListSubheader>}
        style={{ width: "80%" }}>
        {files
          .filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i)
          .map((file, index) => {
            return (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar>{FileIcons[file.type.split("/")[0]]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  style={{ textOverflow: "ellipsis" }}
                  primary={`${file?.name}`}
                  secondary={`${formatSize(file?.size)} • Sent by ${
                    file?.sentBy.displayName
                  }`}
                />
                <ContextMenu
                  file={file}
                  index={index}
                  handleCloseD={handleCloseD}
                />
              </ListItem>
            );
          })}
      </List>
    )
  );
};

const ContextMenu = ({ file, index, handleCloseD }) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const save = async () => {
    const fileRef = createDocRef(`users/${user.uid}/files`);
    await setDoc(fileRef, {
      id: fileRef.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
      parentId: "shared",
      path: [
        { id: "/", name: "Home" },
        { id: "//shared", name: "Shared" },
      ],
      owner: {
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      createdAt: serverTimestamp(),
    });
    handleMenuClose();
  };
  return (
    <>
      <IconButton
        id={`basic-button-${index}`}
        aria-controls="basic-menu"
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleMenu}>
        <MoreVertOutlined fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": `basic-button-${index}`,
        }}>
        <MenuList dense>
          <MenuItem
            component={MuiLink}
            href={file.url}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              handleMenuClose();
            }}>
            <ListItemIcon>
              <FileDownloadOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
          {file.sentBy.uid === user.uid ? (
            <MenuItem
              component={Link}
              to={file.parentId === user.uid ? "/" : `/folder/${file.parentId}`}
              onClick={() => {
                setTimeout(() => {
                  handleCloseD();
                }, 500);
              }}>
              <ListItemIcon>
                <FolderOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Open file location</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={save}>
              <ListItemIcon>
                <CloudDownloadOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Save to Shared</ListItemText>
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </>
  );
};

export default Upload;
