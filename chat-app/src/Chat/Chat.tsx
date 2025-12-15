import { useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket";
import { BackgroundRippleEffect } from "../components/ui/background-ripple-effect";
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

export default function Chat() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const chatUrl = (import.meta as any).env?.VITE_CHAT_WS_URL || "ws://localhost:8082";
  const { send, data } = useWebSocket(chatUrl);

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

    const messageObj: Message = {
      user: {
        id: "user1",
        name: "You",
        avatar: "https://api.dicebear.com/7.x/avatars/svg?seed=User1",
      },
      message: input,
      timestamp: new Date().toISOString(),
    };

    send(JSON.stringify(messageObj));
    setInput("");
  }

  return (
    <div className="h-screen p-2 grid grid-rows-[1fr_auto] gap-2 text-black bg-gray-100  transition w-110">
      <BackgroundRippleEffect />

      <div
        id="chatBox"
        className="overflow-y-auto p-2 h-[80vh] bg-white dark:bg-gray-800 rounded shadow z-10"
      >
        <AspectRatio ratio={16 / 9}>
          {messages.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-900 text-center  p-2 dark:bg-gray-400 hover:bg-gray-500 duration-300 shadow-2xl">
              No messages yet ...
            </p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="relative mb-4">

              
                <div className="relative rounded-xl p-4 border dark:border-gray-700">


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
          onKeyPress={(e) => e.key === "Enter" && handleMessage()}
          className="text-black hover:scale-105 dark:text-white bg-white dark:bg-gray-600 flex-1 p-2 rounded border duration-500 ease-in-out"
          placeholder="Type a message..."
        />

        <HoverBorderGradient onClick={handleMessage} className="">
          Send
        </HoverBorderGradient>
      </div>
    </div>
  );
}
