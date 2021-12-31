import {
  DeleteOutline,
  DriveFileRenameOutline,
  FileDownloadOutlined,
  Folder,
  InfoOutlined,
  MoreVertOutlined,
  ShareOutlined,
  VisibilityOutlined,
  CloseOutlined,
  FolderOutlined,
  ContentCopyOutlined,
} from "@mui/icons-material";
import {
  Button,
  IconButton,
  ListSubheader,
  Paper,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  ListItemText,
  Link as MuiLink,
  ListItemIcon,
  MenuList,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Avatar,
} from "@mui/material";
import { deleteDoc, onSnapshot, query, where } from "firebase/firestore";
import { deleteObject } from "firebase/storage";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useFolder } from "../context/FolderProvider";
import {
  createCollectionRef,
  createOnlyDocRef,
  createStorageRef,
} from "../utils/firebase";
import { formatSize, HomeURL } from "../utils/format";
import { Rename } from "./NewFolder";
import { FileIcons } from "./UploadComp";

const FileExplorer = () => {
  const { folderId, setFolderId, setPath, path } = useFolder();
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(path);
    const q1 = query(
      createCollectionRef(`users/${user.uid}/folders`),
      where("parentId", "==", folderId)
    );
    const q2 = query(
      createCollectionRef(`users/${user.uid}/files`),
      where("parentId", "==", folderId)
    );
    const unsub = onSnapshot(q1, (ss) => {
      const docs = ss.docs.map((doc) => doc.data());
      setFolders(docs);
    });
    const unsub2 = onSnapshot(q2, (ss) => {
      const docs = ss.docs.map((doc) => doc.data());
      setFiles(docs);
    });
    return () => {
      unsub && unsub();
      unsub2 && unsub2();
    };
  }, [folderId]);

  const handleClickFolder = (folderId) => {
    navigate(`/folder/${folderId}`);
  };

  return (
    <div>
      {folders.length > 0 && (
        <div>
          <ListSubheader>Folders</ListSubheader>
          <div className="list2">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                style={{ maxWidth: "200px" }}
                variant="outlined"
                startIcon={<Folder />}
                onClick={() => {
                  handleClickFolder(folder.id);
                }}>
                <div
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}>
                  {folder.name}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
      {files.length > 0 && (
        <div>
          <ListSubheader>Files</ListSubheader>
          <div className="list">
            {files.map((file) => (
              <Paper
                key={file.id}
                variant="outlined"
                style={{ height: "200px", width: "200px" }}>
                <div className="fileIcon" style={{ height: "155px" }}>
                  {file.type.split("/")[0] === "image" ? (
                    <img src={file.url} alt={file.name} />
                  ) : (
                    FileIcons[file.type.split("/")[0]]
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "5px",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden",
                    }}>
                    {FileIcons[file.type.split("/")[0]]}
                    <Tooltip title={file.name}>
                      <Typography
                        sx={{
                          ml: 1,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                        variant="caption">
                        {file.name}
                      </Typography>
                    </Tooltip>
                  </div>
                  <ContextMenu file={file} />
                </div>
              </Paper>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ContextMenu = ({ file }) => {
  const { user } = useAuth();
  const { path } = useFolder();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [openD, setOpenD] = useState(false);
  const [openR, setOpenR] = useState(false);
  const handleClickOpen = () => {
    setOpenD(true);
  };
  const handleClose = () => {
    setOpenD(false);
  };
  const handleCloseR = () => {
    setOpenR(false);
  };
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const share = () => {
    if (navigator.share) {
      navigator.share({
        url: `${HomeURL}/file/${file.id}`,
        text: file.name,
        title: "Share File",
      });
    }
  };
  const delDoc = async () => {
    const fileRef = createStorageRef(
      `${user.uid}/${path[path.length - 1].id.slice(1)}/${file.name}`
    );
    try {
      await deleteDoc(createOnlyDocRef(`users/${user.uid}/files/${file.id}`));
      await deleteObject(fileRef);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <IconButton
        id={`basic-button-${file.id}`}
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
          "aria-labelledby": `basic-button-${file.id}`,
        }}>
        <MenuList dense>
          <MenuItem>
            <ListItemIcon>
              <VisibilityOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>Preview</ListItemText>
          </MenuItem>
          <Divider />
          {navigator.canShare ? (
            <MenuItem onClick={share}>
              <ListItemIcon>
                <ShareOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                navigator.clipboard.writeText(`${HomeURL}/file/${file.id}`);
                handleMenuClose();
              }}>
              <ListItemIcon>
                <ContentCopyOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy Link</ListItemText>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setOpenR(true);
              handleMenuClose();
            }}>
            <ListItemIcon>
              <DriveFileRenameOutline fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleClickOpen();
              handleMenuClose();
            }}>
            <ListItemIcon>
              <InfoOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>

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
          <Divider />
          <MenuItem onClick={delDoc}>
            <ListItemIcon>
              <DeleteOutline fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
      <Details onClose={handleClose} open={openD} file={file} />
      <Rename open={openR} handleClose={handleCloseR} file={file} />
    </>
  );
};
export const Details = ({ onClose, open, file }) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>
        Details
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {file.type.split("/")[0] === "image" && (
          <div style={{ textAlign: "center" }}>
            <img
              style={{
                width: "250px",
              }}
              src={file.url}
              alt={file.name}
            />
            <Divider />
          </div>
        )}
        <Typography variant="h6">{file.name}</Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Type"
              secondary={file.type || "Unknown File"}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Size" secondary={formatSize(file.size)} />
          </ListItem>

          <ListItem>
            <ListItemText
              primary="Uploaded"
              secondary={`${file?.createdAt?.toDate()}`}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Avatar src={file.owner.photoURL} />
            </ListItemIcon>
            <ListItemText
              primary="Owner"
              secondary={`${file.owner.displayName}`}
            />
          </ListItem>
          <ListItem
            component={Link}
            to={
              file.path[file.path.length - 1].id.split("/").pop()
                ? `/folder/${file.path[file.path.length - 1].id
                    .split("/")
                    .pop()}`
                : "/"
            }>
            <ListItemIcon>
              <FolderOutlined />
            </ListItemIcon>
            <ListItemText
              primary="Location"
              secondary={`${file.path[file.path.length - 1].name}`}
            />
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
};
export default FileExplorer;
