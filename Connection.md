TL;DR
Socket.IO rooms = logical “call‑ids” that let you broadcast a WebRTC signal only to the peers that belong to the same call.
Signaling flow = join → offer → answer → ice‑candidate (plus optional chat messages).
Room lifecycle = create → fill (2 peers) → active → close (or timeout) → cleanup.
Scaling = move state out of the single Node process (Redis pub/sub, a DB for rooms, load‑balancer sticky‑sessions or a signalling‑gateway) and add monitoring/metrics.
1. Core Server Layout (Express + Socket.IO + Chat WS)
Component	Responsibility
Express	Serves static HTML/JS, health‑check endpoints.
Socket.IO (signalling)	Handles WebRTC offer/answer/ICE and room membership.
Chat WebSocket (optional separate WS)	Simple text chat, can reuse the same Socket.IO namespace.
Typical file structure

src/
 ├─ index.js          // Express + Socket.IO bootstrap
 ├─ signalling.js     // socket.io event handlers
 ├─ chat.js           // optional chat namespace
 └─ utils/
      └─ roomManager.js   // in‑memory room map (or Redis wrapper)
2. Socket.IO Rooms – How They Work
// client
socket.emit('join', {roomId});          // ask server to put you in a room
socket.on('joined', (data) => {...});

// server (signalling.js)
io.on('connection', socket => {
  socket.on('join', ({roomId}) => {
    const room = io.sockets.adapter.rooms.get(roomId) || new Set();
    if (room.size >= 2) return socket.emit('full');

    socket.join(roomId);
    socket.emit('joined', {roomId, peers: [...room]});
    socket.to(roomId).emit('peer-joined', {peerId: socket.id});
  });
});
Why rooms?

Only the two participants in a call receive each other’s SDP/ICE.
socket.to(roomId).emit(...) automatically excludes the sender.
When a third user tries to join you can reject (full) or create a new room.
Room data you may want to store (outside of Socket.IO’s adapter):

creatorId, createdAt, type (audio/video/text), status (waiting/active/ended).
Persisted in Redis or a small DB for graceful restarts.
3. Signalling Event Flow
1️⃣  client A  ──> join(roomId) ──> server
2️⃣  server   adds A to room, emits "joined"
3️⃣  client B  ──> join(roomId) ──> server
4️⃣  server   adds B, emits "joined" to B and "peer-joined" to A
5️⃣  A (caller) creates RTCPeerConnection, gathers ICE, creates offer
6️⃣  A  ──> offer( SDP ) ──> server ──> B (via room broadcast)
7️⃣  B  setsRemoteDescription(offer), creates answer
8️⃣  B  ──> answer( SDP ) ──> server ──> A
9️⃣  Both peers exchange ICE:
        - each ICE candidate → server → other peer
🔟  When `ontrack` fires, media flows P2P.
Minimal server handlers
// signalling.js
io.on('connection', socket => {
  // join handled above ...

  socket.on('offer', ({roomId, sdp}) => {
    socket.to(roomId).emit('offer', {from: socket.id, sdp});
  });

  socket.on('answer', ({roomId, sdp}) => {
    socket.to(roomId).emit('answer', {from: socket.id, sdp});
  });

  socket.on('ice-candidate', ({roomId, candidate}) => {
    socket.to(roomId).emit('ice-candidate', {from: socket.id, candidate});
  });

  // optional chat
  socket.on('chat-message', ({roomId, msg}) => {
    socket.to(roomId).emit('chat-message', {from: socket.id, msg});
  });

  // cleanup on disconnect
  socket.on('disconnect', () => {
    // leave all rooms, notify peers
    const rooms = [...socket.rooms].filter(r => r !== socket.id);
    rooms.forEach(r => socket.to(r).emit('peer-left', {peerId: socket.id}));
    // optional: delete empty rooms from your DB/Redis
  });
});
4. Room Lifecycle Management
Phase	Trigger	Action
Create	First join for a new roomId	socket.join(roomId); store metadata (creator, timestamp).
Waiting	Only one participant present	Keep room open for X seconds (e.g., 30 s) → if timeout, emit room-timeout and delete.
Active	Second participant joins	Broadcast peer-joined; mark status = active.
Close	Either peer disconnects or explicitly sends leave	Emit room-closed to remaining peer; delete metadata; optionally archive call log.
Cleanup	Server restart or periodic job	Scan stored rooms; delete stale entries (no sockets, > TTL).
Implementation tip: keep a room manager that abstracts the in‑memory map and the Redis fallback. Example API:

// utils/roomManager.js
export const createRoom = (id, owner) => { ... };
export const addPeer = (id, socketId) => { ... };
export const removePeer = (id, socketId) => { ... };
export const getRoom = id => { ... };
export const pruneStale = () => { ... };
5. Scaling the Signalling Service
Scaling Concern	What You Need
Multiple Node instances	Use a Socket.IO adapter backed by Redis (socket.io-redis) so rooms are shared across processes.
Persistent room state	Store metadata (creator, timestamps, status) in Redis or a lightweight DB (PostgreSQL, Mongo).
Load balancing	Front‑end a TCP/HTTP load balancer (NGINX, HAProxy, Cloud‑LB) with sticky sessions (io uses the io.sockets.id cookie) or use Socket.IO’s built‑in “engine.io” cluster mode.
Horizontal scaling	Deploy as a Docker/K8s service; each replica runs the same code, connects to the same Redis cluster.
Fault tolerance	- Redis HA (sentinel or clustered). <br> - Graceful shutdown hooks: process.on('SIGTERM') → close sockets, finish ongoing handshakes.
Metrics & monitoring	- Export socket.io events to Prometheus (socket.io-prometheus). <br> - Track: active rooms, peers per room, connection errors, ICE‑candidate latency.
Security	- Authenticate sockets (JWT, session cookie) before allowing join. <br> - Rate‑limit join/offer messages (e.g., express-rate-limit + socket.io-rate-limit).
Media relay (optional)	If you later need TURN/MCU for group calls, add a TURN server (coturn) and optionally an SFU (mediasoup, Janus) – the signalling stays the same, just forward offer/answer that contain the relay candidates.
Minimal scaling‑ready code snippet
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// ---- Redis adapter (shared across pods) ----
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));

// ---- JWT auth middleware (example) ----
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const payload = verifyJwt(token, process.env.JWT_SECRET);
    socket.user = payload;
    next();
  } catch (e) {
    next(new Error('unauthorized'));
  }
});

import './signalling.js';   // registers all events
import './chat.js';

httpServer.listen(process.env.PORT || 3000);
6. Checklist for “Ready to Scale”
Redis adapter configured and tested (rooms visible across two Node processes).
Stateless signalling – only room metadata lives in Redis/DB; no local caches.
Auth & rate‑limit middleware on the Socket.IO connection.
Graceful‑shutdown script that closes io and drains connections.
Health‑check endpoint (/health) that reports Redis connectivity and server load.
Observability – Prometheus metrics + logs (structured JSON) for joins, leaves, errors.
CI/CD – container image builds, Helm/K8s manifests with replicas > 1.
TURN server deployed (coturn) for NAT traversal in production.
Optional SFU (mediasoup) if you later need >2 participants or recording.
Bottom line
Rooms give you per‑call isolation; keep them light and let Redis share them.
Signalling events are simple pass‑throughs (offer, answer, ice-candidate).
Lifecycle should be explicit (create → active → close) and cleaned up on disconnect or timeout.
Scaling is mostly about externalizing state (Redis), adding a load balancer with sticky sessions, and instrumenting the service. Once those pieces are in place, adding more pods is a one‑line deployment change.