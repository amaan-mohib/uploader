import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useFolder } from "../context/FolderProvider";
import fileSystem from "../model/fileSystem";
import { createDocRef, createOnlyDocRef } from "../utils/firebase";

const NewFolder = ({ open = false, handleClose = () => { } }) => {
  const [name, setName] = useState("Untitled Folder");
  const [disabled, setDisabled] = useState(false);
  const { user } = useAuth();
  const { folderId } = useFolder();
  const [error, setError] = useState(false);

  const handleFolder = async () => {
    const dir = fileSystem.findDirectory(fileSystem.root, folderId);
    if (dir && dir.hasItem(name)) {
      setError(true);
    } else {
      const folderRef = createDocRef(`users/${user.uid}/folders`);
      setDisabled(true);
      await setDoc(folderRef, {
        id: folderRef.id,
        name,
        parentId: folderId,
        owner: {
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        createdAt: serverTimestamp(),
      });
      setDisabled(false);
      setError(false);
      handleClose();
    }
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New Folder</DialogTitle>
      <DialogContent style={{ display: "flex", flexDirection: "column" }}>
        <TextField
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
        {error && <Typography variant="caption" color="error">{`Folder already exists`}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={disabled} color="error">
          Cancel
        </Button>
        <Button onClick={handleFolder} disabled={disabled} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const Rename = ({ open = false, handleClose = () => { }, file, folder }) => {
  const [name, setName] = useState(file ? file.name : folder.name || "Untitled File");
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState(false);
  const { user } = useAuth();

  const handleFolder = async () => {
    if (file) {
      const fileRef = createOnlyDocRef(`users/${user.uid}/files/${file.id}`);
      setDisabled(true);
      await updateDoc(fileRef, {
        name,
      });
      setDisabled(false);
      handleClose();
    } else {
      const dir = fileSystem.findDirectory(fileSystem.root, folder.id);
      if (name === folder.name) {
        setError(false);
        console.log("skip");
      }
      else if (dir && dir.parent.hasItem(name)) {
        setError(true)
      } else {
        fileSystem.openDirectory(dir.parent.id);
        fileSystem.renameItem(folder.name, name);
        const folderRef = createOnlyDocRef(`users/${user.uid}/folders/${folder.id}`);
        setDisabled(true);
        await updateDoc(folderRef, {
          name,
        });
        setDisabled(false);
        setError(false);
        handleClose();
      }
    }

  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Rename</DialogTitle>
      <DialogContent style={{ display: "flex", flexDirection: "column" }}>
        <TextField
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
        {error && <Typography variant="caption" color="error">{`Folder already exists`}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={disabled} color="error">
          Cancel
        </Button>
        <Button onClick={handleFolder} disabled={disabled} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewFolder;
