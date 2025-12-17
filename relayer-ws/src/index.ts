import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));

const PORT = Number(process.env.PORT) || 8081;
const server = http.createServer(app);

// ✅ Use only ONE source of truth for room membership
const rooms = new Map<string, Set<string>>(); // roomId → Set<socketId>

const io = new Server(server, {
  cors: { origin: allowedOrigin },
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join", ({ room }: { room: string }) => {
    const targetRoom = room || "default";
    
    // Leave any previous rooms (clean up old room membership)
    for (const oldRoom of socket.rooms) {
      if (oldRoom === socket.id) continue; // skip default room

      // Remove from our tracking
      const oldRoomSet = rooms.get(oldRoom);
      if (oldRoomSet) {
        oldRoomSet.delete(socket.id);
        if (oldRoomSet.size === 0) {
          rooms.delete(oldRoom);
        }
        // Notify others in old room (optional)
        socket.to(oldRoom).emit("user-left", { peerId: socket.id });
      }
    }

    // Join new room
    socket.join(targetRoom);
    socket.data.room = targetRoom;

    // Track in our rooms Map
    if (!rooms.has(targetRoom)) {
      rooms.set(targetRoom, new Set());
    }
    rooms.get(targetRoom)!.add(socket.id);

    // Get existing peers (from OUR tracking, not adapter)
    const existingPeers = Array.from(rooms.get(targetRoom)!).filter(id => id !== socket.id);

    // Send to joining client
    socket.emit("existing-users", { peers: existingPeers });

    // Notify others in the room
    socket.to(targetRoom).emit("new-user", { peerId: socket.id });

    console.log(`Socket ${socket.id} joined room: ${targetRoom}. Total: ${rooms.get(targetRoom)!.size}`);
  });

  // --- Signaling forwarding (room-safe) ---
  socket.on("offer", (data: { to: string; sdp: any }) => {
    // Optional: verify 'to' is in same room (security)
    io.to(data.to).emit("offer", { from: socket.id, sdp: data.sdp });
  });

  socket.on("answer", (data: { to: string; sdp: any }) => {
    io.to(data.to).emit("answer", { from: socket.id, sdp: data.sdp });
  });

  socket.on("ice-candidate", (data: { to: string; candidate: RTCIceCandidateInit }) => {
    io.to(data.to).emit("ice-candidate", { from: socket.id, candidate: data.candidate });
  });

  socket.on("leave-room", ({ room }: { room: string }) => {
    if (rooms.has(room)) {
      const roomSet = rooms.get(room)!;
      roomSet.delete(socket.id);
      if (roomSet.size === 0) {
        rooms.delete(room);
      }
    }
    socket.leave(room);
    socket.to(room).emit("user-left", { peerId: socket.id });
  });

  // --- Cleanup on disconnect ---
  socket.on("disconnect", () => {
    // Clean up from all rooms
    for (const [roomId, roomSet] of rooms.entries()) {
      if (roomSet.has(socket.id)) {
        roomSet.delete(socket.id);
        socket.to(roomId).emit("user-left", { peerId: socket.id });
        if (roomSet.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});

// ===== Chat WebSocket (unchanged, but note: unrelated to WebRTC) =====
import { WebSocketServer } from "ws";
const CHAT_PORT = Number(process.env.CHAT_PORT) || 8082;
const wss = new WebSocketServer({ port: CHAT_PORT });

wss.on("connection", (ws) => {
  console.log("Chat WS client connected");
  ws.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(message);
    });
  });
  ws.on("close", () => console.log("Chat WS client disconnected"));
});
console.log(`Chat WS listening on ws://localhost:${CHAT_PORT}`);