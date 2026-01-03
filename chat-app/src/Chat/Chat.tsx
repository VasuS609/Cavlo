import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "./useWebSocket";
import { HoverBorderGradient } from "../components/ui/hover-border-gradient";
import { AspectRatio } from "../components/ui/aspect-ratio";

interface Message {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  message: string;
  timestamp?: string;
}

const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES = 100;

export default function Chat() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const chatUrl = (import.meta as any).env?.VITE_CHAT_WS_URL || "ws://localhost:8082";
  const { send, data, readyState, isConnecting } = useWebSocket(chatUrl);

  const isConnected = readyState === WebSocket.OPEN;

  useEffect(() => {
    if (!data) return;
    if (typeof data !== "string") {
      console.warn("Ignoring non-text websocket payload", data);
      return;
    }

    try {
      const parsedMessage: Message = JSON.parse(data);
      
      // Validate message structure
      if (!parsedMessage.user || !parsedMessage.message) {
        console.error("Invalid message structure");
        return;
      }
      
      // Sanitize message content
      const sanitizedMessage = {
        ...parsedMessage,
        message: sanitizeInput(parsedMessage.message)
      };
      
      setMessages((prev) => {
        const updated = [...prev, sanitizedMessage];
        // Keep only last MAX_MESSAGES to prevent memory issues
        return updated.slice(-MAX_MESSAGES);
      });
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      }, 100);
    } catch (e) {
      console.error("Failed to parse message:", e);
    }
  }, [data]);

  function sanitizeInput(text: string): string {
    // Remove potentially harmful characters
    return text
      .replace(/[<>]/g, '')
      .substring(0, MAX_MESSAGE_LENGTH)
      .trim();
  }

  function handleMessage() {
    if (!input.trim()) return;
    if (!isConnected) {
      alert("Not connected to chat server");
      return;
    }

    const sanitizedInput = sanitizeInput(input);
    if (!sanitizedInput) return;

    const messageObj: Message = {
      user: {
        id: "user1",
        name: "You",
        avatar: "https://api.dicebear.com/7.x/avatars/svg?seed=User1",
      },
      message: sanitizedInput,
      timestamp: new Date().toISOString(),
    };

    send(JSON.stringify(messageObj));
    setInput("");
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-2 grid grid-rows-[1fr_auto] gap-2 text-black bg-gray-100  transition w-110">
      
      <div
        ref={chatBoxRef}
        id="chatBox"
        className="overflow-y-auto p-2 h-[80vh] bg-white dark:bg-gray-800 rounded shadow z-10"
      >
        {isConnecting && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-2">
            Connecting to chat server...
          </div>
        )}
        {readyState === WebSocket.CLOSED && !isConnecting && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
            Disconnected from chat server. Reconnecting...
          </div>
        )}
        
        <AspectRatio ratio={16 / 9}>
          {messages.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-900 text-center  p-2 dark:bg-gray-400 hover:bg-gray-500 duration-300 shadow-2xl">
              No messages yet ...
            </p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="relative mb-4">

              
                <div className="relative  p-4  rounded-xlborder dark:border-gray-700">


                  <div className="flex gap-3 items-start relative z-10">
                    {/* Avatar */}
                    <img
                      src={msg.user.avatar}
                      alt={msg.user.name}
                      className="w-10 h-10 rounded-full shrink-0"
                    />

                    {/* Message Content */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <strong className="text-gray-900 dark:text-white">
                          {msg.user.name}
                        </strong>

                        {msg.timestamp && (
                          <span className=" text-gray-500 text-xs">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </AspectRatio>
      </div>

      {/* Input */}
      <div className="flex gap-2 z-10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleMessage()}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={!isConnected}
          className="text-black hover:scale-105 dark:text-white bg-white dark:bg-gray-600 flex-1 p-2 rounded border duration-500 ease-in-out disabled:opacity-50"
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
        />

        <HoverBorderGradient onClick={handleMessage} className="">
          Send
        </HoverBorderGradient>
      </div>
    </div>
  );
}
