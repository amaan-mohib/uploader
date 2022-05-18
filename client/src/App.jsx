import "./App.css";
import Home from "./components/Home";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useFolder } from "./context/FolderProvider";
import { useAuth } from "./context/AuthProvider";
import { createOnlyDocRef } from "./utils/firebase";
import { getDoc } from "firebase/firestore";

function App() {
  const { id } = useParams();
  const { setFolderId } = useFolder();
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(async () => {
    if (id) {
      if (id === "shared") {
        setFolderId("shared");
      } else {
        setFolderId(id);
        const docRef = createOnlyDocRef(`users/${user.uid}/folders/${id}`);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          navigate("/error");
        }
      }
    } else {
      setFolderId(user.uid);
    }
  }, [id]);
  return <Home />;
}

export default App;
