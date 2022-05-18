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
  CloudDownloadOutlined,
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
import {
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { deleteObject } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { useAuth } from "../context/AuthProvider";
import { useFolder } from "../context/FolderProvider";
import fileSystem from "../model/fileSystem";
import {
  createCollectionRef,
  createDocRef,
  createOnlyDocRef,
  createStorageRef,
} from "../utils/firebase";
import { formatSize, HomeURL } from "../utils/format";
import { Rename } from "./NewFolder";
import { FileIcons } from "./UploadComp";

const FileExplorer = () => {
  const { folderId } = useFolder();
  const { uid, fid } = useParams();
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    const q1 = query(
      createCollectionRef(`users/${uid || user?.uid}/folders`),
      where("parentId", "==", fid ? fid : folderId)
    );
    const q2 = query(
      createCollectionRef(`users/${uid || user?.uid}/files`),
      where("parentId", "==", fid ? fid : folderId)
    );
    const unsub = onSnapshot(q1, (ss) => {
      const docs = ss.docs.map((doc) => doc.data());
      setFolders(docs);
    });
    const unsub2 = onSnapshot(q2, (ss) => {
      const docs = ss.docs.map((doc) => doc.data());
      setFiles(docs);
      setLoading(false);
    });
    return () => {
      unsub && unsub();
      unsub2 && unsub2();
    };
  }, [folderId, fid, uid]);

  const handleClickFolder = (folderId) => {
    navigate(`/folder${uid ? `/${uid}` : ""}/${folderId}`);
  };
  const ref = useRef(null);

  return (
    !loading && (
      <div ref={ref}>
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
              {files.map((file, index) => (
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
                    {uid ? (
                      <ContextMenuPreview
                        file={file}
                        setVisible={setVisible}
                        setIndex={setIndex}
                        index={index}
                      />
                    ) : (
                      <ContextMenu
                        file={file}
                        setVisible={setVisible}
                        setIndex={setIndex}
                        index={index}
                      />
                    )}
                  </div>
                </Paper>
              ))}
            </div>
          </div>
        )}
        <Viewer
          visible={visible}
          images={files.map((file) => ({
            src: file.type.split("/")[0] !== "image" ? "" : file.url,
            alt: file.name,
            downloadUrl: file.type.split("/")[0] !== "image" ? "" : file.url,
          }))}
          downloadable
          downloadInNewWindow
          activeIndex={index}
          onClose={() => setVisible(false)}
        />
      </div>
    )
  );
};

const ContextMenu = ({ file, setVisible, setIndex, index }) => {
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
        url: `${HomeURL}/file/${user.uid}/${file.id}`,
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
          <MenuItem
            onClick={() => {
              if (file.type.split("/")[0] === "image") {
                setVisible(true);
                setIndex(index);
                handleMenuClose();
              }
            }}
            component={Link}
            to={file.type.split("/")[0] === "image" ? "" : `/file/${file.id}`}>
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
                navigator.clipboard.writeText(
                  `${HomeURL}/file/${user.uid}/${file.id}`
                );
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

const ContextMenuPreview = ({ file, setVisible, setIndex, index }) => {
  const { user } = useAuth();
  const { uid } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [openD, setOpenD] = useState(false);
  const handleClickOpen = () => {
    setOpenD(true);
  };
  const handleClose = () => {
    setOpenD(false);
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
        url: `${HomeURL}/file/${uid || user?.uid}/${file.id}`,
        text: file.name,
        title: "Share File",
      });
    }
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
      owner: file.owner,
      createdAt: serverTimestamp(),
    });
    handleMenuClose();
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
          <MenuItem
            onClick={() => {
              if (file.type.split("/")[0] === "image") {
                setVisible(true);
                setIndex(index);
                handleMenuClose();
              }
            }}
            component={Link}
            to={
              file.type.split("/")[0] === "image"
                ? ""
                : `/file${uid ? `/${uid}` : ""}/${file.id}`
            }>
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
                navigator.clipboard.writeText(
                  `${HomeURL}/file/${uid || user?.uid}/${file.id}`
                );
                handleMenuClose();
              }}>
              <ListItemIcon>
                <ContentCopyOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy Link</ListItemText>
            </MenuItem>
          )}
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

          {user &&
            (file.owner.photoURL === user.photoURL ? (
              <MenuItem
                component={Link}
                to={
                  file.parentId === user.uid ? "/" : `/folder/${file.parentId}`
                }>
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
            ))}
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
        </MenuList>
      </Menu>
      <Details onClose={handleClose} open={openD} file={file} />
    </>
  );
};

export const Details = ({ onClose, open, file }) => {
  const { user } = useAuth();
  const [path, setPath] = useState({
    id: user ? user.uid : file.parentId,
    name: "Home"
  })

  useEffect(() => {
    const dir = fileSystem.findDirectory(fileSystem.root, file.parentId);
    if (dir) {
      setPath({
        id: dir.id,
        name: dir.name,
      });
    }
  }, [])

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
          {user && file.owner.photoURL === user.photoURL && (
            <ListItem
              component={Link}
              to={
                path.name === "Home" ? "/" : `/folder/${path.id}`
              }>
              <ListItemIcon>
                <FolderOutlined />
              </ListItemIcon>
              <ListItemText
                primary="Location"
                secondary={`${path.name}`}
              />
            </ListItem>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};
export default FileExplorer;
