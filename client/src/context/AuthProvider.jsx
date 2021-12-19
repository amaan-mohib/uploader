import { onAuthStateChanged, signOut } from "@firebase/auth";
import { CircularProgress } from "@mui/material";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../utils/firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  logout: () => {},
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
      {loading ? <CircularProgress /> : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
