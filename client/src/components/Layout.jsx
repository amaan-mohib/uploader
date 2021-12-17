import { FileUploadOutlined } from "@mui/icons-material";
import { AppBar, Avatar, IconButton, Toolbar } from "@mui/material";
import { Box } from "@mui/system";
// import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import Upload from "./Upload";

const Layout = ({ children }) => {
  const { user, loading } = useAuth();
  // const router = useRouter();
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push("/login");
  //   }
  // }, [user, loading]);
  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="sticky" component="nav">
          <Toolbar>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "start",
              }}>
              <FileUploadOutlined sx={{ mr: 1 }} fontSize="large" />
              <h2>Uploader</h2>
            </Box>
            {user ? (
              <div>
                <IconButton>
                  <Avatar alt={user.displayName} src={user.photoURL} />
                </IconButton>
              </div>
            ) : null}
          </Toolbar>
        </AppBar>
        {user && <Upload />}
      </Box>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
