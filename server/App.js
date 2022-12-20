import express from "express";
const app = express();
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("Client connected with id " + socket.id);

  socket.on("disconnect", (object) => {
    const roomId = rooms[socket.id];
    console.log("Client disconnected and he was at room "+roomId);

    if (roomId) {
      // Leave the room
      socket.leave(roomId);

      // Update the room data
      if (roomId in io.sockets.adapter.rooms) {
        io.sockets.adapter.rooms[roomId].count--;
        const index = io.sockets.adapter.rooms[roomId].names.indexOf(socket.id);
        io.sockets.adapter.rooms[roomId].names.splice(index, 1);
        // Emit the 'current_players' event to all clients in the room
        io.to(roomId).emit(
          "current_players",
          io.sockets.adapter.rooms[roomId].names
        );
      }
    }
  });

  socket.on("join_game", (data) => {
    if (!(data.room_id in io.sockets.adapter.rooms)) {
      io.sockets.adapter.rooms[data.room_id] = {
        count: 1,
        names: [data.player_name],
      };
    } else {
      if (io.sockets.adapter.rooms[data.room_id].count === 2) {
        // if two players already in the room
        socket.emit("room_full");

        return;
      }
      io.sockets.adapter.rooms[data.room_id].count++;
      io.sockets.adapter.rooms[data.room_id].names.push(data.player_name);
    }
    rooms[socket.id] = data.room_id;

    socket.emit("room_available");

    socket.join(data.room_id);
    console.log("Player joind with name "+data.player_name);

    // Emit the 'current_players' event to all clients in the room
    io.to(data.room_id).emit(
      "current_players",
      io.sockets.adapter.rooms[data.room_id].names
    );
  });

  socket.on("new_move", (data) => {
    const object = {
      data: data.boardState,
      connectionId: socket.id,
      player: data.player,
    };
    io.to(data.roomId).emit("new_board", object);
  });

  socket.on("clear_board", (data) => {
    io.to(data.roomId).emit("board_cleared");
  });
});

server.listen(3001, () => {
  console.log("Server running ...");
});
