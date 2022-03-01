const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const short = require("short-uuid");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
let users = {};
let onlineUsers = {};

io.on("connect", (socket) => {
  console.log(`${socket.id} connected`);
  socket.on("join", ({ uuid = "", user = {} }, callback) => {
    socket.join(uuid);
    console.log("uuid:", uuid, "user:", user);
    onlineUsers[socket.id] = { uuid, user };
    console.log("online: ", onlineUsers);
    users[uuid] = users[uuid] || [];
    users[uuid].push(user);
    console.log(`[${uuid}]: `, users[uuid]);
    io.to(uuid).emit("connected users", {
      connected: users[uuid],
    });
    callback();
  });
  socket.on("send files", ({ uuid, files }, callback) => {
    io.to(uuid).emit("recieve files", files);
    callback();
  });
  socket.on("disconnect", (reason) => {
    if (onlineUsers[socket.id]) {
      const uuid = onlineUsers[socket.id].uuid;
      const user = onlineUsers[socket.id].user;
      if (user.host === true) {
        io.to(uuid).emit("connected users", {
          connected: [],
        });
        delete users[uuid];
      } else {
        if (users[uuid]) {
          let newUser = users[uuid].filter((user) => user.sid !== socket.id);
          console.log(uuid, "newUser: ", newUser);
          users[uuid] = newUser;
          io.to(uuid).emit("connected users", {
            connected: users[uuid],
          });
        }
      }
      delete onlineUsers[socket.id];
    }
    console.log(`${socket.id} disconnected due to ${reason}`);
  });
});

app.get("/", (req, res) => {
  res.send("Hello there");
});

app.get("/user/:sid", (req, res) => {
  const sid = req.params.sid;
  const result = onlineUsers[sid] ? true : false;
  res.send(result);
});

app.get("/is-users/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  const result = users[uuid] ? true : false;
  res.send(result);
});

app.get("/host/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  let host = "";
  users[uuid].forEach((user) => {
    if (user.host === true) host = user.sid;
  });
  res.send(host);
});

app.get("/short/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  const translator = short();
  try {
    const shortUUID = translator.fromUUID(uuid);
    res.send(shortUUID);
  } catch (error) {
    console.error(error);
  }
});

server.listen(process.env.PORT || 5000, () =>
  console.log("server running at http://localhost:5000")
);
