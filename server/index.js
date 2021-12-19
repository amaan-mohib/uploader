const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
let users = {};
let onlineUsers = {
  id: {
    user: {
      uid: "",
      host: false,
      info: "",
    },
    uuid: "",
  },
};
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
  socket.on("disconnect", (reason) => {
    const uuid = onlineUsers[socket.id].uuid;
    const user = onlineUsers[socket.id].user;
    if (user.host === true) {
      io.to(uuid).emit("connected users", {
        connected: [],
      });
      delete users[uuid];
    } else {
      let newUser = users[uuid].filter((user) => user.sid !== socket.id);
      console.log(uuid, "newUser: ", newUser);
      users[uuid] = newUser;
      io.to(uuid).emit("connected users", {
        connected: users[uuid],
      });
    }
    delete onlineUsers[socket.id];
    console.log(`${socket.id} disconnected due to ${reason}`);
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log("server running at http://localhost:5000")
);
