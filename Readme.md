# 💬 Cavlo - Real-Time Video Chat & Communication Platform

A scalable WebRTC-based video chat application with Auth0 authentication, featuring real-time communication, interactive 3D globe, and modern UI.

## ✨ Features

- 🎥 **Video/Audio Calls** - WebRTC peer-to-peer connections
- 💬 **Real-time Chat** - WebSocket-based messaging
- 🌍 **3D Globe** - Interactive Three.js globe with connection arcs
- 🗺️ **World Map** - Animated dotted world map showing global connections
- 🔐 **Auth0** - Secure authentication
- 🎨 **Modern UI** - Tailwind CSS v4 + Framer Motion animations

## 🏗️ Architecture

### Stateless vs Stateful Design

| Stateless (Our Approach) | Stateful |
|--------------------------|----------|
| ✅ Easy to scale (ASG, HPA, VPA) | ❌ Hard to scale |
| ✅ State in database | ❌ State in memory |
| ✅ Any server handles requests | ❌ Tied to specific server |

### System Architecture

```
React Frontend ──WebSocket/Socket.IO──> Relayer WS Server ──> Peer Connections
   (Vite)                                (Express + Socket.IO)      (WebRTC)
     │                                           │
     │                                           ├─ Socket.IO (port 8081)
     └─ Auth0 ──────────────────────────────────┴─ WebSocket (port 8082)
```

## 📦 Project Structure

```
Cavlo/
├── chat-app/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # UI components (Globe, WorldMap, Cards)
│   │   ├── pages/         # Landing, Chat, Login pages
│   │   ├── room/          # Video room components
│   │   └── Chat/          # Chat functionality
│   └── package.json
│
└── relayer-ws/            # Backend (Node.js + Socket.IO)
    ├── src/
    │   └── index.ts       # Server with Socket.IO & WebSocket
    └── package.json
```

**Why?** Database stores state centrally → compute can happen anywhere → easy horizontal scaling

---

## 🚀 Quick Setup

### 1. Install Backend

```bash
cd relayer-ws
npm install
```

### 2. Install Frontend

```bash
cd chat-app
npm install
```

### 3. Configure Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Create **Single Page Application**
3. Add to settings:
   - **Callback URL:** `http://localhost:5173/callback`
   - **Logout URL:** `http://localhost:5173`
   - **Web Origins:** `http://localhost:5173`
4. **Disable "Require Organization"** (important!)

### 4. Create Environment Files

**Frontend** (`chat-app/.env`):
```bash
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

**Backend** (`relayer-ws/.env`):
```bash
PORT=8081
CHAT_PORT=8082
CORS_ORIGIN=http://localhost:5173
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd relayer-ws
npm run dev
```
Servers start on:
- Socket.IO: `http://localhost:8081`
- Chat WebSocket: `ws://localhost:8082`

**Terminal 2 - Frontend:**
```bash
cd chat-app
npm run dev
```
Frontend starts on: `http://localhost:5173`

---

## 📁 Structure

```
src/
├── pages/          # Landing, Login, Callback, Chat
├── Chat/           # Chat component + WebSocket hook
├── authentication/ # Auth0 buttons & profile
└── components/     # UI components
```

---

## 🔐 Auth Flow

```
Landing → Login → Auth0 → Callback → Chat (Protected)
```

---

## 🐛 Common Issues

**"parameter organization is required"**
→ Disable "Require Organization" in Auth0 app settings

**WebSocket not connecting**
→ Ensure WebSocket server running on port 8080

**Auth0 redirect loop**
→ Clear cache, verify callback URL matches exactly

---

## 🚀 Scaling Strategy

- **HPA** - Horizontal Pod Autoscaler (scale pods based on CPU/memory)
- **VPA** - Vertical Pod Autoscaler (adjust resource limits)
- **Node Autoscaling** - Add/remove cluster nodes
- **Database** - Centralized state enables stateless compute layer

**WebSocket Relayer:** Acts as bidirectional pipe, routes messages, stores in DB

---

## 📝 Tech Stack

**Frontend:** React, TypeScript, Tailwind, Vite
**Auth:** Auth0
**Real-time:** WebSocket
**UI:** shadcn/ui, Lucide icons
