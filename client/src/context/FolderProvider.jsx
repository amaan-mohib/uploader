import { onSnapshot, orderBy, query } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import fileSystem from "../model/fileSystem";
import { createCollectionRef } from "../utils/firebase";
import { useAuth } from "./AuthProvider";

const FolderContext = createContext({
  folderId: "",
  setFolderId: () => { },
  path: [{ id: "", name: "" }],
  setPath: () => { },
});

export const useFolder = () => {
  return useContext(FolderContext);
};

const FolderProvider = ({ children }) => {
  const { user } = useAuth();
  const [folderId, setFolderId] = useState(user?.uid || null);
  const [path, setPath] = useState([{ id: "/", name: "Home" }]);
  const [built, setBuilt] = useState(false);
  const value = { folderId, setFolderId, path };



  useEffect(() => {
    let unsub;
    if (user) {
      fileSystem.init(user.uid);

      const q = query(createCollectionRef(`users/${user.uid}/folders`), orderBy("createdAt"));
      unsub = onSnapshot(q, (ss) => {
        setBuilt(false);
        const folders = ss.docs.map(doc => doc.data());
        fileSystem.buildTree([...folders, { name: "Shared", id: "shared", parentId: user.uid }], user.uid);
        setBuilt(true);
      })
    }

    return () => {
      unsub && unsub();
    }
  }, [])

  useEffect(() => {
    if (folderId && built) {
      fileSystem.openDirectory(folderId);
      setPath(fileSystem.currentDirectoryPath);
    }
  }, [folderId, built])

  return (
    <FolderContext.Provider value={value}>{children}</FolderContext.Provider>
  );
};

export default FolderProvider;
