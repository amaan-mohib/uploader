import { ChevronLeft } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}>
      <Typography variant="h1">404</Typography>
      <Typography sx={{ mt: 1, mb: 1 }}>
        The requested URL was not found
      </Typography>
      <Button
        startIcon={<ChevronLeft />}
        onClick={() => {
          navigate("/");
        }}>
        Home
      </Button>
    </div>
  );
};

export default NotFound;
