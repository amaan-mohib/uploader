import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthProvider";

const FolderContext = createContext({
  folderId: "",
  setFolderId: () => {},
  path: [{ id: "", name: "" }],
  setPath: () => {},
});

export const useFolder = () => {
  return useContext(FolderContext);
};

const FolderProvider = ({ children }) => {
  const { user } = useAuth();
  const [folderId, setFolderId] = useState(user?.uid || null);
  const [path, setPath] = useState([{ id: "/", name: "Home" }]);
  const value = { folderId, setFolderId, path, setPath };

  return (
    <FolderContext.Provider value={value}>{children}</FolderContext.Provider>
  );
};

export default FolderProvider;
