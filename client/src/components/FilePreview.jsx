import { getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { createOnlyDocRef } from "../utils/firebase";
import Viewer from "react-viewer";
import FileViewer from "react-file-viewer";
import { FileIcons } from "./UploadComp";
import {
  IconButton,
  Link as MuiLink,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  FileDownloadOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { Details } from "./FileExplorer";

const FilePreview = () => {
  const { fileId, uid } = useParams();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(async () => {
    const docRef = createOnlyDocRef(
      `users/${uid || user?.uid}/files/${fileId}`
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setFile(docSnap.data());
    }
  }, []);
  return (
    <div>
      <nav
        className="file-nav"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "50px",
          padding: "10px",
          zIndex: 1010,
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
          <Tooltip title="Home" sx={{ mr: 1 }}>
            <IconButton component={Link} to="/">
              <ArrowBack />
            </IconButton>
          </Tooltip>
          {file && FileIcons[file.type.split("/")[0]]}
          <Typography
            sx={{
              ml: 1,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
            variant="caption">
            {file?.name}
          </Typography>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
          <Tooltip title="Download">
            <IconButton
              component={MuiLink}
              href={file?.url}
              download={file?.name}
              target="_blank"
              rel="noopener noreferrer">
              <FileDownloadOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Details" onClick={() => setOpen(true)}>
            <IconButton>
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </div>
      </nav>
      {file && (
        <Details open={open} onClose={() => setOpen(false)} file={file} />
      )}
      {file ? (
        file.type.split("/")[0] === "image" ? (
          <Viewer
            visible={true}
            images={[{ src: file.url, alt: file.name, downloadUrl: file.url }]}
            noClose={true}
            noNavbar
            downloadable
            downloadInNewWindow
            showTotal={false}
          />
        ) : (
          <div style={{ width: "100%", height: `calc(100vh - 50px)` }}>
            <FileViewer
              fileType={file.name.split(".").pop()}
              filePath={file.url}
            />
          </div>
        )
      ) : (
        <p>No such file exists</p>
      )}
    </div>
  );
};

export default FilePreview;
