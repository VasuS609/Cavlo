import { roomManager } from "./room-manager";
import { logger } from "../../utils/logger";

// Registry to store WebSocket connections by ID
export const wsRegistry = new Map<string, any>();
// Keep track of which room each WebSocket is in
export const wsToRoomMap = new Map<string, string>();

export function handleJoinRoom(ws: any, payload: any) {
  const targetRoom = payload?.room || "default";

  // Leave any previous rooms first
  const currentRoom = wsToRoomMap.get(ws.id);
  if (currentRoom) {
    // Remove from old room tracking and notify others
    broadcastToRoom(
      currentRoom,
      { type: "user-left", payload: { peerId: ws.id } },
      ws.id,
    );
  }

  // Join new room
  roomManager.joinRoom(targetRoom, ws.id);
  // Update our local mapping
  wsToRoomMap.set(ws.id, targetRoom);

  // Get existing peers in the room (excluding this socket)
  const existingPeers = roomManager.getRoomMembers(targetRoom, ws.id);

  // Send existing users to joining client
  ws.send({ type: "existing-users", payload: { peers: existingPeers } });

  // Notify others in the room about the new user
  broadcastToRoom(
    targetRoom,
    { type: "new-user", payload: { peerId: ws.id } },
    ws.id,
  );

  logger.debug(`Socket ${ws.id} joined room: ${targetRoom}`);
}

export function handleLeaveRoom(ws: any) {
  const roomId = wsToRoomMap.get(ws.id);
  if (!roomId) {
    ws.send({ type: "error", payload: "Not in any room" });
    return;
  }

  // Remove from room tracking
  roomManager.leaveRoom(roomId, ws.id);
  wsToRoomMap.delete(ws.id);

  // Notify others in the room
  broadcastToRoom(
    roomId,
    { type: "user-left", payload: { peerId: ws.id } },
    ws.id,
  );

  logger.debug(`Socket ${ws.id} left room: ${roomId}`);
}

export function handleForwardMessage(ws: any, message: any) {
  const roomId = wsToRoomMap.get(ws.id);
  if (!roomId) {
    ws.send({ type: "error", payload: "Must join a room first" });
    return;
  }

  // Extract recipient from payload
  const { to, ...forwardPayload } = message.payload || {};
  if (!to) {
    ws.send({ type: "error", payload: "Recipient ID required for signaling" });
    return;
  }

  // Verify recipient is in the same room (security)
  if (!roomManager.isInRoom(roomId, to)) {
    ws.send({ type: "error", payload: "Recipient not in same room" });
    return;
  }

  // Forward the message to the specific recipient
  const targetWs = wsRegistry.get(to);
  if (!targetWs) {
    logger.warn(`Target WebSocket ${to} not found for forwarding message`);
    ws.send({ type: "error", payload: "Recipient not connected" });
    return;
  }

  // Send message to target with sender info
  targetWs.send({
    type: message.type,
    payload: { ...forwardPayload, from: ws.id },
  });
}

export function broadcastToRoom(
  roomId: string,
  message: any,
  excludeWsId?: string,
) {
  const members = roomManager.getRoomMembers(roomId, excludeWsId);
  for (const memberId of members) {
    const ws = wsRegistry.get(memberId);
    if (ws) {
      try {
        ws.send(message);
      } catch (err) {
        logger.error("Failed to broadcast to room member", {
          error: err,
          memberId,
        });
      }
    }
  }
}
