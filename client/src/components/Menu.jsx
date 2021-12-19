import { Button } from "@mui/material";
import React from "react";
import { logout } from "../utils/firebase";

const Menu = () => {
  return (
    <div>
      <Button onClick={logout}>Log out</Button>
    </div>
  );
};

export default Menu;
