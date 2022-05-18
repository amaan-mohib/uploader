import { onAuthStateChanged, signOut } from "@firebase/auth";
import { CircularProgress } from "@mui/material";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import FolderProvider from "./FolderProvider";

const AuthContext = createContext({
  user: { uid: null, displayName: "", email: "" },
  loading: true,
  logout: () => { },
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clear = () => {
    setUser(null);
    setLoading(true);
  };

  useEffect(() => {
    let unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => {
      clear();
      unsub && unsub();
    };
  }, []);

  const logout = () => {
    signOut(auth)
      .then(() => {
        clear();
      })
      .catch((err) => console.error(err));
  };
  const value = { user, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <CircularProgress />
        </div>
      ) : (
        <FolderProvider>{children}</FolderProvider>
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
