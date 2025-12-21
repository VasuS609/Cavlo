import { logger } from "../../utils/logger";
// Room management system
class RoomManager {
  // roomId → Set<wsId>
  private rooms: Map<string, Set<string>> = new Map();

  /**
   * Join a room
   * @param roomId The room ID to join
   * @param wsId The WebSocket ID joining the room
   * @returns boolean indicating if the user is the first in the room
   */
  joinRoom(roomId: string, wsId: string): boolean {
    // Leave any previous rooms first (cleanup)
    this.leaveAllRooms(wsId);

    // Create room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    const roomSet = this.rooms.get(roomId)!;
    const wasEmpty = roomSet.size === 0;

    roomSet.add(wsId);

    logger.debug(`WS ${wsId} joined room: ${roomId}. Total: ${roomSet.size}`);

    return wasEmpty; // true if this user is the first in the room
  }

  /**
   * Leave a specific room
   * @param roomId The room ID to leave
   * @param wsId The WebSocket ID leaving the room
   * @returns boolean indicating if the room was deleted (became empty)
   */
  leaveRoom(roomId: string, wsId: string): boolean {
    const roomSet = this.rooms.get(roomId);
    if (!roomSet) {
      return false;
    }

    const wasInRoom = roomSet.has(wsId);
    if (wasInRoom) {
      roomSet.delete(wsId);

      // Clean up empty rooms
      if (roomSet.size === 0) {
        this.rooms.delete(roomId);
        logger.debug(`Room ${roomId} deleted (became empty)`);
      }

      logger.debug(`WS ${wsId} left room: ${roomId}`);
      return true;
    }

    return false;
  }

  /**
   * Leave all rooms for a specific WebSocket ID
   * @param wsId The WebSocket ID leaving all rooms
   * @returns Array of rooms that were affected
   */
  leaveAllRooms(wsId: string): string[] {
    const roomsLeft: string[] = [];

    for (const [roomId, roomSet] of this.rooms.entries()) {
      if (roomSet.has(wsId)) {
        roomSet.delete(wsId);

        // Clean up empty rooms
        if (roomSet.size === 0) {
          this.rooms.delete(roomId);
          logger.debug(`Room ${roomId} deleted (became empty)`);
        }

        roomsLeft.push(roomId);
      }
    }

    logger.debug(`WS ${wsId} left all rooms: [${roomsLeft.join(", ")}]`);
    return roomsLeft;
  }

  /**
   * Get all WebSocket IDs in a specific room
   * @param roomId The room ID to get members for
   * @returns Array of WebSocket IDs in the room (excluding the requesting ID if provided)
   */
  getRoomMembers(roomId: string, excludeWsId?: string): string[] {
    const roomSet = this.rooms.get(roomId);
    if (!roomSet) {
      return [];
    }

    const members = Array.from(roomSet);
    if (excludeWsId) {
      return members.filter((id) => id !== excludeWsId);
    }

    return members;
  }

  /**
   * Check if a WebSocket is in a specific room
   * @param roomId The room ID to check
   * @param wsId The WebSocket ID to check
   * @returns boolean indicating if the WebSocket is in the room
   */
  isInRoom(roomId: string, wsId: string): boolean {
    const roomSet = this.rooms.get(roomId);
    return roomSet ? roomSet.has(wsId) : false;
  }

  /**
   * Get all rooms
   * @returns Array of room IDs
   */
  getAllRooms(): string[] {
    return Array.from(this.rooms.keys());
  }

  /**
   * Get total number of rooms
   * @returns Number of active rooms
   */
  getRoomCount(): number {
    return this.rooms.size;
  }

  /**
   * Get total number of connections across all rooms
   * @returns Number of WebSocket connections in rooms
   */
  getTotalConnections(): number {
    let count = 0;
    for (const roomSet of this.rooms.values()) {
      count += roomSet.size;
    }
    return count;
  }
}

export const roomManager = new RoomManager();
