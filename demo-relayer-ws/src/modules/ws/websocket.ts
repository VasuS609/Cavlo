import { Elysia } from "elysia";
import { WsMessageSchema, WsResponseSchema } from "./ws.types";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { logger } from "../../utils/logger";
import { roomManager } from "./room-manager";
import {
  handleJoinRoom,
  handleLeaveRoom,
  handleForwardMessage,
  broadcastToRoom,
  wsRegistry,
  wsToRoomMap,
} from "./room-handler";

const MessageValidator = TypeCompiler.Compile(WsMessageSchema);
const ResponseValidator = TypeCompiler.Compile(WsResponseSchema);

export const websocketPlugin = new Elysia({ name: "websocket" }).ws("/ws", {
  body: WsMessageSchema,
  response: WsResponseSchema,
  open(ws) {
    logger.info(`WS client connected: ${ws.id}`);
    ws.send({ type: "welcome", payload: "Connected to server" });

    // Register the WebSocket connection
    wsRegistry.set(ws.id, ws);

    // Set up heartbeat
    const heartbeat = setInterval(() => {
      try {
        ws.send({ type: "pong", payload: null });
      } catch (err) {
        logger.error(`Heartbeat failed for ${ws.id}:`, { error: err });
        clearInterval(heartbeat);
      }
    }, 30000);

    // Store interval in ws.data for cleanup
    (ws.data as any).heartbeat = heartbeat;
  },
  message(ws, msg: unknown) {
    let parsed: any;

    // Elysia may parse JSON automatically, so check if it's already an object
    if (typeof msg === "string") {
      try {
        parsed = JSON.parse(msg);
      } catch (err) {
        logger.error("WS message parsing error", { error: err, wsId: ws.id });
        ws.send({ type: "error", payload: "Invalid JSON message" });
        return;
      }
    } else if (typeof msg === "object" && msg !== null) {
      // Message is already parsed as an object
      parsed = msg;
    } else {
      ws.send({ type: "error", payload: "Message must be a valid JSON object or string" });
      return;
    }

    // Validate against schema
    if (!MessageValidator.Check(parsed)) {
      const errors = [...MessageValidator.Errors(parsed)];
      const errorMsg = `Validation failed: ${errors.map((e) => e.message).join(", ")}`;
      logger.warn("WS message validation failed", {
        wsId: ws.id,
        errors: errors.map((e) => e.message),
      });
      ws.send({ type: "error", payload: errorMsg });
      return;
    }

    logger.debug(`WS message from ${ws.id}:`, { message: parsed });

    // Handle different message types
    switch (parsed.type) {
      case "join":
        handleJoinRoom(ws, parsed.payload);
        break;
      case "leave-room":
        handleLeaveRoom(ws);
        break;
      case "offer":
      case "answer":
      case "ice-candidate":
        handleForwardMessage(ws, parsed);
        break;
      case "ping":
        ws.send({ type: "pong", payload: null });
        break;
      default:
        // Echo back other messages with timestamp
        ws.send({
          type: "echo",
          payload: { ...parsed, timestamp: Date.now() },
        });
    }
  },
  close(ws) {
    logger.info(`WS client disconnected: ${ws.id}`);

    // Remove from all rooms
    const roomsLeft = roomManager.leaveAllRooms(ws.id);
    for (const roomId of roomsLeft) {
      // Notify others in the room
      broadcastToRoom(
        roomId,
        { type: "user-left", payload: { peerId: ws.id } },
        ws.id,
      );
    }

    // Remove from registry
    wsRegistry.delete(ws.id);
    // Clear mapping
    wsToRoomMap.delete(ws.id);

    // Clear heartbeat interval
    if ((ws.data as any)?.heartbeat) {
      clearInterval((ws.data as any).heartbeat);
    }
  },
});
