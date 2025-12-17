import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));


const PORT = Number(process.env.PORT) || 8081;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigin },
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join a specific room and notify peers within that room only
  socket.on("join", ({roomId} :{roomId:string}) => {
    const targetRoom = roomId || "default";
    socket.join(targetRoom);
    console.log(`Socket ${socket.id} joined room: `, targetRoom);
    // Get peers in this room (excluding self)
    const roomSet = io.sockets.adapter.rooms.get(targetRoom);
    const peers = roomSet ? Array.from(roomSet).filter(id => id !== socket.id) : [];
    socket.emit("existing-users", { peers });

    // Notify others in the same room
    socket.to(targetRoom).emit("new-user", { peerId: socket.id });
  });

  socket.on("offer", (data: { to: string; sdp: any }) => {
    io.to(data.to).emit("offer", { from: socket.id, sdp: data.sdp });
  });

  socket.on("answer", (data: { to: string; sdp: any }) => {
    io.to(data.to).emit("answer", { from: socket.id, sdp: data.sdp });
  });

  socket.on(
    "ice-candidate",
    (data: { to: string; candidate: RTCIceCandidateInit }) => {
      io.to(data.to).emit("ice-candidate", {
        from: socket.id,
        candidate: data.candidate,
      });
    }
  );

  socket.on("leave-room", ({ room }: { room: string }) => {
    socket.leave(room);
  });

  socket.on("disconnect", () => {
    // Notify all rooms this socket was part of (except its own id room)
    for (const room of socket.rooms) {
      if (room === socket.id) continue;
      socket.to(room).emit("user-left", { peerId: socket.id });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Relayer WS listening on http://localhost:${PORT}`);
});

// Simple Chat WebSocket server (raw ws) on port 8082
const CHAT_PORT = Number(process.env.CHAT_PORT) || 8082;
const wss = new WebSocketServer({ port: CHAT_PORT });

wss.on("connection", (ws) => {
  console.log("Chat WS client connected");

  ws.on("message", (message) => {
    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // 1 = OPEN
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Chat WS client disconnected");
  });
});

console.log(`Chat WS listening on ws://localhost:${CHAT_PORT}`);