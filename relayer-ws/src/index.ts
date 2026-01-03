import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import "./chat"; // Start the chat WebSocket server

const app = express();

// Production-ready CORS configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

const PORT = Number(process.env.PORT) || 8081;
const server = http.createServer(app);

const rooms = new Map<string, Set<string>>(); // roomId → Set<socketId>
const MAX_ROOM_SIZE = Number(process.env.MAX_ROOM_SIZE) || 10;

// Rate limiting: Track message counts per socket
const messageCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_MESSAGES = 100;

// Cleanup rate limit data periodically
setInterval(() => {
  const now = Date.now();
  for (const [socketId, data] of messageCounts.entries()) {
    if (now > data.resetTime) {
      messageCounts.delete(socketId);
    }
  }
}, RATE_LIMIT_WINDOW);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["POST", "GET"],
    credentials: true
  },
  maxHttpBufferSize: 1e6, // 1MB max message size
  pingTimeout: 60000,
  pingInterval: 25000
});

app.get("/health", (req, res) => { //get route
  res.json({ 
    status: "ok", 
    timestamp: Date.now(),
    connections: io.engine.clientsCount,
    rooms: rooms.size
  });
});

// Rate limiting helper
function checkRateLimit(socketId: string): boolean {
  const now = Date.now();
  const data = messageCounts.get(socketId);
  
  if (!data || now > data.resetTime) {
    messageCounts.set(socketId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (data.count >= RATE_LIMIT_MAX_MESSAGES) {
    return false;
  }
  
  data.count++;
  return true;
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);


  socket.on("join", ({ room }: { room: string }) => {
    console.log(`Socket ${socket.id} requests to join room: ${room}`);
    const targetRoom = (room || "default").substring(0, 50); // Limit room name length
    
    // Validate room name
    if (!/^[a-zA-Z0-9_-]+$/.test(targetRoom)) {
      socket.emit("error", { message: "Invalid room name" });
      return;
    }
    
    // Check room size limit
    if (rooms.has(targetRoom) && rooms.get(targetRoom)!.size >= MAX_ROOM_SIZE) {
      socket.emit("error", { message: "Room is full" });
      return;
    }
    
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
        // Notify others in old room
        socket.to(oldRoom).emit("user-left", { peerId: socket.id });
      }
    }

    // Join new room
    socket.join(targetRoom);
    socket.data.room = targetRoom;

  
    if (!rooms.has(targetRoom)) {
      rooms.set(targetRoom, new Set());
    }
    rooms.get(targetRoom)!.add(socket.id);

    const existingPeers = Array.from(rooms.get(targetRoom)!).filter(id => id !== socket.id);

    socket.emit("existing-users", { peers: existingPeers });

    // Notify others in the room
    socket.to(targetRoom).emit("new-user", { peerId: socket.id });

    console.log(`Socket ${socket.id} joined room: ${targetRoom}. Total: ${rooms.get(targetRoom)!.size}`);
  });

  // --- Signaling forwarding (room-safe) ---
  socket.on("offer", (data: { to: string; sdp: any }) => {
    if (!checkRateLimit(socket.id)) {
      socket.emit("error", { message: "Rate limit exceeded" });
      return;
    }
    io.to(data.to).emit("offer", { from: socket.id, sdp: data.sdp });
  });

  socket.on("answer", (data: { to: string; sdp: any }) => {
    if (!checkRateLimit(socket.id)) {
      socket.emit("error", { message: "Rate limit exceeded" });
      return;
    }
    io.to(data.to).emit("answer", { from: socket.id, sdp: data.sdp });
  });

  socket.on("ice-candidate", (data: { to: string; candidate: RTCIceCandidateInit }) => {
    if (!checkRateLimit(socket.id)) {
      socket.emit("error", { message: "Rate limit exceeded" });
      return;
    }
    io.to(data.to).emit("ice-candidate", { from: socket.id, candidate: data.candidate });
  });

  socket.on("leave-room", () => {
    const room = socket.data.room;

// Remove the user from the room, Clean up empty rooms, Tell other users in the room that this user left
    if(room && rooms.has(room)){
      const roomSet = rooms.get(room)!;
      roomSet.delete(socket.id);
      if(roomSet.size == 0){
        rooms.delete(room);
      }
      socket.leave(room);
      socket.to(room).emit("user-left", {peerId:socket.id});
      console.log(`Socket ${socket.id} left room: ${room}`)
      }
  });

  // --- Cleanup on disconnect ---
  socket.on("disconnect", () => {
    // Clean up from all rooms
    for (const [roomId, roomSet] of rooms.entries()) {
      if (roomSet.has(socket.id)) {
        roomSet.delete(socket.id);
        socket.to(roomId).emit("user-left", { peerId: socket.id });
        if (roomSet.size === 0) {//room is deleted if only one user was there
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
