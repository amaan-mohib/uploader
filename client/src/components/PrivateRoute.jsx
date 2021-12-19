import { useAuth } from "../context/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  let location = useLocation();
  return user ? children : <Navigate to="/login" state={{ from: location }} />;
};

export default PrivateRoute;
