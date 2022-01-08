import { Close, FileUploadOutlined, Menu } from "@mui/icons-material";
import {
  AppBar,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Upload from "./Upload";
import AccountMenu from "./AccountMenu";

const Layout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const container = window.document.body;

  const drawerWidth = 240;

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        component="nav"
        sx={{ zIndex: (theme) => theme.zIndex.drawer / 10 + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}>
            <Menu />
          </IconButton>
          <div style={{ flexGrow: 1 }}>
            <Box
              onClick={() => {
                navigate("/");
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "start",
                ":hover": { cursor: "pointer" },
                width: "max-content",
              }}>
              <FileUploadOutlined fontSize="large" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Uploader
              </Typography>
            </Box>
          </div>
          {user && <AccountMenu />}
        </Toolbar>
      </AppBar>
      {user && (
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}>
            <Toolbar>
              <IconButton onClick={handleDrawerToggle}>
                <Close />
              </IconButton>
            </Toolbar>
            <Divider />
            <Upload />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              zIndex: (theme) => theme.zIndex.drawer / 10,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                zIndex: (theme) => theme.zIndex.drawer / 10,
                width: drawerWidth,
              },
            }}
            open>
            <Toolbar />
            <Upload />
          </Drawer>
        </Box>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
