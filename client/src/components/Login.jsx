import { Google } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../utils/firebase";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleClick = () => {
    login().then((res) => {
      navigate(from, { replace: true });
    });
  };
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        startIcon={<Google />}>
        Sign in with Google
      </Button>
    </div>
  );
};

export default Login;
