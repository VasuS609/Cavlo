import { WebSocketServer } from "ws";
const CHAT_PORT = Number(process.env.CHAT_PORT) || 8082;
const wss = new WebSocketServer({ port: CHAT_PORT });

wss.on("connection", (ws) => {
  console.log("Chat WS client connected");
  ws.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(message);
    });
  });
  ws.on("errro", ()=>{
    console.log("Unexpected error occured: ", Error);
  })
  ws.on("close", () => console.log("Chat WS client disconnected"));
});
console.log(`Chat WS listening on ws://localhost:${CHAT_PORT}`);