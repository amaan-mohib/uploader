import { HomeOutlined } from "@mui/icons-material";
import { Divider, IconButton, Tooltip, Typography } from "@mui/material";
import { getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createOnlyDocRef } from "../utils/firebase";
import FileExplorer from "./FileExplorer";

const FolderPreview = () => {
  const { uid, fid } = useParams();
  const [folderName, setFolderName] = useState("");
  const navigate = useNavigate();
  useEffect(async () => {
    const docRef = createOnlyDocRef(`users/${uid}/folders/${fid}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setFolderName(docSnap.data().name);
    } else {
      navigate("/error");
    }
  }, []);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Tooltip title="Home">
          <IconButton
            color="primary"
            onClick={() => {
              navigate("/");
            }}>
            <HomeOutlined />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Typography sx={{ ml: 1 }}>{folderName}</Typography>
      </div>
      <Divider />
      <FileExplorer />
    </div>
  );
};

export default FolderPreview;
