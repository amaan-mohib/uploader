import {
  ContentCopyOutlined,
  CreateNewFolderOutlined,
  DriveFileRenameOutline,
  KeyboardArrowDown,
  ShareOutlined,
} from "@mui/icons-material";
import {
  Breadcrumbs,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
} from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useFolder } from "../context/FolderProvider";
import { HomeURL } from "../utils/format";
import FileExplorer from "./FileExplorer";
import NewFolder, { Rename } from "./NewFolder";

const Home = () => {
  const { path } = useFolder();
  const { user } = useAuth();
  const [folder, setFolder] = useState(false);
  const [rename, setRename] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Breadcrumbs maxItems={4} aria-label="breadcrumb">
        {path.map((currentPath, index) =>
          index !== path.length - 1 ? (
            <Button
              disabled={currentPath.id === "shared"}
              key={currentPath.id}
              color="inherit"
              style={{ textTransform: "none" }}
              component={Link}
              to={
                currentPath.id === user?.uid
                  ? "/"
                  : `/folder/${currentPath.id}`
              }>
              {currentPath.name}
            </Button>
          ) : (
            <div key={currentPath.id}>
              <Button
                id="basic-button"
                disabled={currentPath.id === "shared"}
                key={currentPath.id}
                color="primary"
                style={{ textTransform: "none" }}
                endIcon={<KeyboardArrowDown />}
                aria-controls="basic-menu"
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleMenu}>
                {currentPath.name}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}>
                <MenuList dense>
                  <MenuItem
                    onClick={() => {
                      setFolder(true);
                      handleMenuClose();
                    }}>
                    <ListItemIcon>
                      <CreateNewFolderOutlined fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>New Folder</ListItemText>
                  </MenuItem>
                  {currentPath.name !== "Home" &&
                    <MenuItem
                      onClick={() => {
                        setRename(true);
                        handleMenuClose();
                      }}>
                      <ListItemIcon>
                        <DriveFileRenameOutline fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Rename</ListItemText>
                    </MenuItem>
                  }
                  {currentPath.name !== "Home" &&
                    (navigator.share ? (
                      <MenuItem
                        onClick={() => {
                          navigator.share({
                            url: `${HomeURL}/folder/${user.uid}/${currentPath.id}`,
                            text: currentPath.name,
                            title: "Share Folder",
                          });
                          handleMenuClose();
                        }}>
                        <ListItemIcon>
                          <ShareOutlined fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Share</ListItemText>
                      </MenuItem>
                    ) : (
                      <MenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${HomeURL}/folder/${user.uid}/${currentPath.id}`
                          );
                          handleMenuClose();
                        }}>
                        <ListItemIcon>
                          <ContentCopyOutlined fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Copy Link</ListItemText>
                      </MenuItem>
                    ))}
                </MenuList>
              </Menu>
              <NewFolder open={folder} handleClose={() => setFolder(false)} />
              <Rename open={rename} handleClose={() => setRename(false)} folder={currentPath} />
            </div>
          )
        )}
      </Breadcrumbs>
      <Divider />
      <FileExplorer />
    </div>
  );
};

export default Home;
