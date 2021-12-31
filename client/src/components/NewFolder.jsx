import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useFolder } from "../context/FolderProvider";
import { createDocRef, createOnlyDocRef } from "../utils/firebase";

const NewFolder = ({ open = false, handleClose = () => {} }) => {
  const [name, setName] = useState("Untitled Folder");
  const [disabled, setDisabled] = useState(false);
  const { user } = useAuth();
  const { path, folderId } = useFolder();

  const handleFolder = async () => {
    const folderRef = createDocRef(`users/${user.uid}/folders`);
    setDisabled(true);
    const newPath = path[path.length - 1].id;
    await setDoc(folderRef, {
      id: folderRef.id,
      name,
      path: [
        ...path,
        {
          id: newPath + `/${folderRef.id}`,
          name: name,
        },
      ],
      parentId: folderId,
      owner: {
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      createdAt: serverTimestamp(),
    });
    setDisabled(false);
    handleClose();
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New Folder</DialogTitle>
      <DialogContent>
        <TextField
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
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

export const Rename = ({ open = false, handleClose = () => {}, file }) => {
  const [name, setName] = useState(file.name || "Untitled File");
  const [disabled, setDisabled] = useState(false);
  const { user } = useAuth();

  const handleFolder = async () => {
    const folderRef = createOnlyDocRef(`users/${user.uid}/files/${file.id}`);
    setDisabled(true);
    await updateDoc(folderRef, {
      name,
    });
    setDisabled(false);
    handleClose();
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Rename</DialogTitle>
      <DialogContent>
        <TextField
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
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
