import io from "socket.io-client";
export const ENDPOINT = import.meta.env.DEV
  ? "http://localhost:5000/"
  : "https://delta-uploader-api.herokuapp.com/";

const socket = io(ENDPOINT, {
  transports: ["websocket", "polling", "flashsocket"],
});

export default socket;
