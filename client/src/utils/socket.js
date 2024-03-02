import io from "socket.io-client";
export const ENDPOINT = import.meta.env.DEV
  ? "http://localhost:5000/"
  : // : "https://delta-uploader-api.herokuapp.com/";
    "https://uploader-krv6.onrender.com/";

const socket = io(ENDPOINT, {
  transports: ["websocket", "polling", "flashsocket"],
});

export default socket;
