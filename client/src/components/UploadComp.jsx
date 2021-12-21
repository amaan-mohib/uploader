import {
  Add,
  ArticleOutlined,
  AudioFileOutlined,
  Image,
  InsertDriveFileOutlined,
  VideoFileOutlined,
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
} from "@mui/material";
import { useState } from "react";
import { formatSize } from "../utils/format";

const UploadComp = () => {
  const [files, setFiles] = useState([]);
  const FileIcons = {
    image: <Image style={{ color: "black" }} />,
    audio: <AudioFileOutlined style={{ color: "black" }} />,
    video: <VideoFileOutlined style={{ color: "black" }} />,
    application: <InsertDriveFileOutlined style={{ color: "black" }} />,
    text: <ArticleOutlined style={{ color: "black" }} />,
    "": <InsertDriveFileOutlined style={{ color: "black" }} />,
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
            const array = [];
            Array.from(e.target.files).forEach((file) =>
              array.push({
                name: file.name,
                size: file.size,
                type: file.type.split("/") || file.type,
              })
            );
            console.log(array);
            setFiles(array);
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
          <Button variant="outlined">{`Upload (${files.length})`}</Button>
        )}
      </div>
      {files.length > 0 && (
        <>
          <Divider style={{ width: "80%", margin: "15px" }} />
          <List
            subheader={<ListSubheader>Files</ListSubheader>}
            style={{ width: "80%" }}>
            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar>{FileIcons[file.type[0]]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${file?.name}`}
                  secondary={formatSize(file?.size)}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </div>
  );
};

export default UploadComp;
