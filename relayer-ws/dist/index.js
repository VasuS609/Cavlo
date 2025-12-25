"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
require("./chat"); // Start the chat WebSocket server
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const PORT = Number(process.env.PORT) || 8081;
const server = http_1.default.createServer(app);
const rooms = new Map(); // roomId → Set<socketId>
const io = new socket_io_1.Server(server, {
    cors: {
        origin: `http://localhost:${PORT}`,
        methods: ["POST", "GET"] // Browser ⇄⇄⇄ Server   creating WebSocket pipe
    },
});
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
});
io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on("join", ({ room }) => {
        const targetRoom = room || "default";
        // Leave any previous rooms (clean up old room membership)
        for (const oldRoom of socket.rooms) {
            if (oldRoom === socket.id)
                continue; // skip default room
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
        if (!rooms.has(targetRoom)) {
            rooms.set(targetRoom, new Set());
        }
        rooms.get(targetRoom).add(socket.id);
        const existingPeers = Array.from(rooms.get(targetRoom)).filter(id => id !== socket.id);
        socket.emit("existing-users", { peers: existingPeers });
        // Notify others in the room
        socket.to(targetRoom).emit("new-user", { peerId: socket.id });
        console.log(`Socket ${socket.id} joined room: ${targetRoom}. Total: ${rooms.get(targetRoom).size}`);
    });
    // --- Signaling forwarding (room-safe) ---
    socket.on("offer", (data) => {
        io.to(data.to).emit("offer", { from: socket.id, sdp: data.sdp });
    });
    socket.on("answer", (data) => {
        io.to(data.to).emit("answer", { from: socket.id, sdp: data.sdp });
    });
    socket.on("ice-candidate", (data) => {
        io.to(data.to).emit("ice-candidate", { from: socket.id, candidate: data.candidate });
    });
    socket.on("leave-room", () => {
        const room = socket.data.room;
        // Remove the user from the room, Clean up empty rooms, Tell other users in the room that this user left
        if (room && rooms.has(room)) {
            const roomSet = rooms.get(room);
            roomSet.delete(socket.id);
            if (roomSet.size == 0) {
                rooms.delete(room);
            }
            socket.leave(room);
            socket.to(room).emit("user-left", { peerId: socket.id });
            console.log(`Socket ${socket.id} left room: ${room}`);
        }
    });
    // --- Cleanup on disconnect ---
    socket.on("disconnect", () => {
        // Clean up from all rooms
        for (const [roomId, roomSet] of rooms.entries()) {
            if (roomSet.has(socket.id)) {
                roomSet.delete(socket.id);
                socket.to(roomId).emit("user-left", { peerId: socket.id });
                if (roomSet.size === 0) { //room is deleted if only one user was there
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
