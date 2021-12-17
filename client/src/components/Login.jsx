import { Google } from "@mui/icons-material";
import { Button } from "@mui/material";
import { login } from "../utils/firebase";

const Login = () => {
  //   const router = useRouter();

  const handleClick = () => {
    login().then((res) => {
      //   console.log(res);
      //   router.push(router.query.next || "/");
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
