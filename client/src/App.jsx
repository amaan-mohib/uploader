// import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Home from "./components/Home";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useFolder } from "./context/FolderProvider";
import { useAuth } from "./context/AuthProvider";
import { createOnlyDocRef } from "./utils/firebase";
import { getDoc } from "firebase/firestore";
// import { Route } from "react-router-dom";

function App() {
  const { id } = useParams();
  const { setFolderId, setPath } = useFolder();
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(async () => {
    if (id) {
      if (id === "shared") {
        setFolderId("shared");
        setPath([
          { id: "/", name: "Home" },
          { id: "//shared", name: "Shared" },
        ]);
      } else {
        setFolderId(id);
        const docRef = createOnlyDocRef(`users/${user.uid}/folders/${id}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPath(data.path);
        } else {
          navigate("/error");
        }
      }
    } else {
      setFolderId(user.uid);
      setPath([{ id: "/", name: "Home" }]);
    }
  }, [id]);
  return <Home />;
}

export default App;
