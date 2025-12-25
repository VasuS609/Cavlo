import { io, Socket } from 'socket.io-client';

type MessageHandler = (data: any) => void;
type HandlerMap = Map<string, MessageHandler>;

export class SignalingService {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private handlers: HandlerMap = new Map();
  private messageQueue: any[] = [];

  connect(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;

    const SIGNALING_URL = (import.meta as any).env?.VITE_SIGNALING_URL || 'http://localhost:8081';

    this.socket = io(SIGNALING_URL, {
      transports: ['websocket'],
      query: { roomId, userId },
    });

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.socket?.emit('joinRoom', { roomId, userId });
      // Flush queued messages
      while (this.messageQueue.length && this.socket?.connected) {
        const msg = this.messageQueue.shift();
        this.socket.emit('message', msg);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      this.reconnect();
    });

    this.socket.on('message', (data: any) => {
      this.handleMessage(data);
    });

    this.socket.on('error', (error: any) => {
      console.error('Signaling error:', error);
      this.handleError(error);
    });
  }

  reconnect() {
    setTimeout(() => {
      if (this.roomId && this.userId) {
        this.connect(this.roomId, this.userId);
      }
    }, 5000);
  }

  sendMessage(message: any) {
    const enriched = {
      ...message,
      roomId: this.roomId,
      userId: this.userId,
    };

    if (this.socket && this.socket.connected) {
      this.socket.emit('message', enriched);
    } else {
      console.warn('Socket not connected, message queued');
      this.messageQueue.push(enriched);
    }
  }

  private handleMessage(data: any) {
    const type = data?.type;
    const handler = type ? this.handlers.get(type) : undefined;
    if (handler) handler(data);
    else console.warn('Unknown message type:', type);
  }

  private handleError(error: any) {
    const handler = this.handlers.get('error');
    if (handler) handler(error);
  }

  on(type: string, callback: MessageHandler) {
    this.handlers.set(type, callback);
  }

  off(type: string) {
    this.handlers.delete(type);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Export singleton instance
export const signalingService = new SignalingService();
