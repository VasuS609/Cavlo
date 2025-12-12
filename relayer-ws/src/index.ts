import { WebSocketServer } from "ws";
import http from 'http';

const server = http.createServer()

const wss = new WebSocketServer({server})

wss.on('connection', async(ws)=>{
  console.log("user is connected");
  ws.send("client is connected")

  ws.on('error',()=> {console.error});
  ws.on('message', (data)=>{
    wss.clients.forEach((client)=>{
      if(client.readyState == ws.OPEN){
        client.send(data.toString());
        console.log(data.toString());
      }
    })

  ws.on('close', ()=>{
    ws.send("user has been disconnected");
  })
  })
})

server.listen(8080, ()=>{
  console.log("server is running on port 8080");
})