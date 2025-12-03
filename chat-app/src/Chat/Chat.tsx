import { useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket";
import { BackgroundRippleEffect } from '../components/ui/background-ripple-effect';
import { HoverBorderGradient } from "../components/ui/hover-border-gradient";
import {AspectRatio} from "../components/ui/aspect-ratio"
interface Message {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  message: string;
  timestamp?: string;
}

export default function Chat() {
  const [input, setInput] = useState<string>("");       
  const [messages, setMessages] = useState<Message[]>([]); // Changed to Message[]

  const { send, data } = useWebSocket("ws://localhost:8080");

  useEffect(() => {
    if (!data) return;

    (async () => {
      let text = "";
      
      if (typeof data === "string") {
        text = data;
      } else if (data instanceof Blob) {
        text = await data.text();
      } else if (data instanceof ArrayBuffer) {
        text = new TextDecoder().decode(data);
      }

      // Parse the JSON message from server
      try {
        const parsedMessage: Message = JSON.parse(text);
        setMessages((prev) => [...prev, parsedMessage]);
      } catch (e) {
        console.error("Failed to parse message:", e);
        console.log("Raw message:", text);
      }
    })();
  }, [data]);

  function handleMessage() {
    if (!input.trim()) return;
    
    // Create message object with user info
    const messageObj: Message = {
      user: {
        id: "user1",
        name: "You",
        avatar: "https://api.dicebear.com/7.x/avatars/svg?seed=User1"
      },
      message: input,
      timestamp: new Date().toISOString()
    };
    
    // Send as JSON string to backend
    send(JSON.stringify(messageObj));
    setInput("");
  }

  return (
    <div className="h-screen p-2 grid grid-rows-[1fr_auto] gap-2 text-black bg-gray-100 dark:bg-gray-700 transition w-85">
             <BackgroundRippleEffect />
      
      <AspectRatio>
        {messages.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center">No messages yet ...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="mb-4 flex gap-3 items-start">
              {/* Avatar */}
              <img 
                src={msg.user.avatar} 
                alt={msg.user.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              
              {/* Message Content */}
              <div className="flex-1 ">
                <div className="flex items-baseline gap-2">
                  <strong className="text-gray-900 dark:text-white">
                    {msg.user.name}
                  </strong>
                  {msg.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {msg.message}
                </p>
              </div>
            </div>
          ))
        )}
    </AspectRatio>

      <div className="flex gap-1 z-10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleMessage()}
          className="text-black dark:text-white bg-white dark:bg-gray-600 flex-1 p-2 rounded border"
          placeholder="Type a message..."
        />
        <HoverBorderGradient
        onClick={handleMessage}
        >
          Send
        </HoverBorderGradient>
      </div>
      
    </div>
  );
}