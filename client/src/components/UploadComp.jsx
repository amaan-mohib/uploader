import {
  Add,
  Article,
  Image,
  InsertDriveFile,
  VideoFile,
  AudioFile,
} from "@mui/icons-material";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListSubheader,
  ListItemAvatar,
  Avatar,
  LinearProgress,
} from "@mui/material";
import { serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useFolder } from "../context/FolderProvider";
import { createDocRef, createStorageRef } from "../utils/firebase";
import { formatSize } from "../utils/format";
import socket from "../utils/socket";

export const FileIcons = {
  image: <Image style={{ color: "red" }} />,
  audio: <AudioFile style={{ color: "yellowgreen" }} />,
  video: <VideoFile style={{ color: "darkorange" }} />,
  application: <InsertDriveFile style={{ color: "darkblue" }} />,
  text: <Article style={{ color: "blue" }} />,
  "": <InsertDriveFile style={{ color: "darkblue" }} />,
};
const UploadComp = ({ isScanner = false, uuid = "" }) => {
  const [files, setFiles] = useState([]);
  const { path, folderId } = useFolder();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    let i = 0;
    setUploading(true);
    for (i = 0; i < files.length; i++) {
      if (!(files[i].size > 10485760)) {
        uploadAsPromise(files[i], isScanner)
          .then(() => {
            setProgress(0);
            if (i == files.length) {
              setFiles([]);
              setUploading(false);
            }
          })
          .catch((err) => setError(err));
      } else {
        setError(
          `Did not upload ${files[i].name} because its too large (>10 MB)`
        );
      }
    }
  };
  const uploadAsPromise = (file, isScanner) => {
    return new Promise((resolve, reject) => {
      const metadata = {
        contentType: file.type,
      };
      const newPath =
        user.uid + "/" + path[path.length - 1].id.slice(1) + "/" + file.name;
      const storageRef = createStorageRef(newPath);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const uploadProgress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(uploadProgress);
        },
        (error) => {
          // https://firebase.google.com/docs/storage/web/handle-errors
          let ecode = "";
          switch (error.code) {
            case "storage/unauthorized":
              ecode = "User doesn't have permission to access the object";
              break;
            case "storage/canceled":
              ecode = "User canceled the upload";
              break;
            case "storage/unknown":
              ecode = "Unknown error occurred, inspect error.serverResponse";
              break;
          }
          reject(ecode);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then(async (downloadURL) => {
              // console.log("File available at", downloadURL);
              const fileRef = createDocRef(`users/${user.uid}/files`);
              await setDoc(fileRef, {
                id: fileRef.id,
                name: file.name,
                type: file.type,
                size: file.size,
                url: downloadURL,
                parentId: folderId,
                path,
                owner: {
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                },
                createdAt: serverTimestamp(),
              });
              if (isScanner) {
                socket.emit(
                  "send files",
                  {
                    uuid,
                    files: {
                      name: file.name,
                      type: file.type,
                      size: file.size,
                      url: downloadURL,
                      parentId: folderId,
                      sentBy: {
                        uid: user.uid,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                      },
                      sentAt: new Date(Date.now()),
                    },
                  },
                  (error) => {
                    if (error) console.error(error);
                  }
                );
              }
              resolve();
            })
            .catch((err) => reject(err));
        }
      );
    });
  };
  return (
    <div className="upload-content">
      <div
        style={{
          display: "flex",
          width: "80%",
          justifyContent: "space-around",
          alignItems: "center",
        }}>
        <input
          id="select-file"
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            setFiles(e.target.files);
          }}
        />
        <label htmlFor="select-file">
          <Button
            startIcon={<Add />}
            color="primary"
            variant="contained"
            component="span">
            Add Files
          </Button>
        </label>
        {files.length > 0 && (
          <Button
            variant="outlined"
            onClick={handleUpload}
            disabled={uploading}>{`Upload (${files.length})`}</Button>
        )}
      </div>
      {files.length > 0 && (
        <div style={{ width: "80%" }}>
          <Divider style={{ width: "100%", margin: "15px 0px" }} />
          {uploading && (
            <LinearProgress variant="determinate" value={progress} />
          )}
          {error && <p>{error}</p>}
          <List subheader={<ListSubheader>Files</ListSubheader>}>
            {Array.from(files).map((file, index) => {
              return (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>{FileIcons[file.type.split("/")[0]]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    style={{ textOverflow: "ellipsis" }}
                    primary={`${file?.name}`}
                    secondary={formatSize(file?.size)}
                  />
                </ListItem>
              );
            })}
          </List>
        </div>
      )}
    </div>
  );
};

export default UploadComp;
