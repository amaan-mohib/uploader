import { GitHub, Google } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { login, loginGH } from "../utils/firebase";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleClick = () => {
    login().then((res) => {
      navigate(from, { replace: true });
    });
  };
  const handleGHClick = () => {
    loginGH().then((res) => {
      navigate(from, { replace: true });
    });
  };
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Typography variant="h5" sx={{ marginBottom: 3 }}>
          Login to continue
        </Typography>
        <Button
          fullWidth
          variant="contained"
          sx={{ marginBottom: 1 }}
          color="primary"
          onClick={handleClick}
          startIcon={<Google />}>
          Sign in with Google
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{ marginBottom: 1 }}
          color="primary"
          onClick={handleGHClick}
          startIcon={<GitHub />}>
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
};

export default Login;
