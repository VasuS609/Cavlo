import { useCallback, useEffect, useRef, useState } from "react";
import {io, Socket} from "socket.io-client"

type RemoteStream ={
  id:string,
  stream:MediaStream
}

const SIGNALING_SERVER_URL = "http://localhost:3000";

export default function Beader() {
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [remoteStream, setRemoteStream] = useState<RemoteStream[]>([]);


  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket|null>(null);
  // map of peer id;
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  //map of peer data channel;
  const dataChannel = useRef<Map<string, RTCDataChannel>>(new Map());
  // Fix: Define dataChannelSendRef properly

  const mediaStreamConstraint = {
    audio: true,
    video: true,
  };

  const rtcConfig:RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  //managess user rejoin and new user name in lisrt
  const upsertRemoteStream = (id:string, stream:MediaStream) =>{
    setRemoteStream((prev)=>{
      const found  = prev.find((r)=> r.id === id);
      if(found) return prev.map((r) =>(r.id === id? {...r,stream}:r));
      return [...prev, {id:stream}];
    })
  }

  //helper to remove remote stream
  const removeRemoteStream = (id:string)=>{
    setRemoteStream((prev)=>prev.filter((r) => r.id === id));
  }

  //createRTc peer connection
  const createPeerConnection = useCallback(
    (peerId:string, isOffer:boolean){
      return peersRef.current.get(peerId)!;
    }
  )

  //ice server
  const pc =new RTCPeerConnection(rtcConfig);

  //add local tracks
  if(localStreamRef.current){
    localStreamRef.current.getTracks().forEach((track)=>{
      pc.addTrack(track, localStreamRef.current as MediaStream);
    })
  }
  
  //icecandidate sends signalling server 
  pc.onicecandidate = (event)=>{
    if(event.candidate && socketRef.current){
      socketRef.current.emit("ice-candidate",{
        to:peerId,
        candidate:event.candidate
      })
    }
  }

  //connection state login
  pc.onconnectionstatechange =()=>{
    console.log(`PC ${peerId} connectionState:`, pc.connectionState);

    if(pc.connectionState == "failed"  || pc.connectionState == "closed"){
      pc.close();
      peersRef.current.delete(peerId);
      dataChannelsRef.current.delete(peerId);
      removeRemoteStream(peerId);
    }
  }

  if(isOfferer){
    const dc = pc.createDataChannel('chat');
    //-if (isOfferer) {
        const dc = pc.createDataChannel("chat");
        dc.onopen = () => console.log("DataChannel open with", peerId);
        dc.onmessage = (msg) => console.log("Message from", peerId, msg.data);
        dataChannelsRef.current.set(peerId, dc);
      } else {
        // if not offerer, listen for incoming data channel
        pc.ondatachannel = (ev) => {
          const incoming = ev.channel;
          incoming.onopen = () => console.log("Incoming data channel open", peerId);
          incoming.onmessage = (m) => console.log("Msg from", peerId, m.data);
          dataChannelsRef.current.set(peerId, incoming);
        };
      }

      peersRef.current.set(peerId, pc);
      return pc;
    },
    []
  );

  // Join: get media, connect socket, inform room
  const handleJoin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // connect signaling socket
      const socket = io(SIGNALING_SERVER_URL, { transports: ["websocket"] });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected", socket.id);
        socket.emit("join-room", { room: "default" });
      });

      // A new user exists in room (someone else) -> create offer to them
      socket.on("user-joined", async (payload: { peerId: string }) => {
        const peerId = payload.peerId;
        console.log("user-joined:", peerId);
        // create pc and make offer
        const pc = createPeerConnection(peerId, true);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: peerId, sdp: offer });
      });

      // When someone offers to us -> set remote desc and create answer
      socket.on("offer", async (payload: { from: string; sdp: RTCSessionDescriptionInit }) => {
        const { from: peerId, sdp } = payload;
        console.log("Received offer from", peerId);
        const pc = createPeerConnection(peerId, false);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: peerId, sdp: answer });
      });

      // When we receive an answer to our offer
      socket.on("answer", async (payload: { from: string; sdp: RTCSessionDescriptionInit }) => {
        const { from: peerId, sdp } = payload;
        console.log("Received answer from", peerId);
        const pc = peersRef.current.get(peerId);
        if (!pc) {
          console.warn("No pc found for", peerId);
          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      // ICE candidate from remote -> add to pc
      socket.on("ice-candidate", async (payload: { from: string; candidate: RTCIceCandidateInit }) => {
        const { from: peerId, candidate } = payload;
        const pc = peersRef.current.get(peerId);
        if (!pc) {
          console.warn("No pc for incoming candidate from", peerId);
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate", err);
        }
      });

      // When a peer leaves
      socket.on("user-left", (payload: { peerId: string }) => {
        const peerId = payload.peerId;
        console.log("user-left", peerId);
        const pc = peersRef.current.get(peerId);
        if (pc) {
          pc.close();
          peersRef.current.delete(peerId);
        }
        dataChannelsRef.current.delete(peerId);
        removeRemoteStream(peerId);
      });

      setIsJoined(true);
    } catch (err: any) {
      console.error("Failed to join:", err);
      setError(err?.message || "Failed to get camera/mic");
    } finally {
      setIsLoading(false);
    }
  }, [createPeerConnection]);

  // Leave and cleanup
  const handleLeave = useCallback(() => {
    // stop tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    // close all peer connections
    peersRef.current.forEach((pc, id) => {
      try {
        pc.close();
      } catch {}
    });
    peersRef.current.clear();
    dataChannelsRef.current.clear();
    setRemoteStreams([]);

    // notify server and disconnect socket
    if (socketRef.current) {
      socketRef.current.emit("leave-room", { room: "default" });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsJoined(false);
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      handleLeave();
    };
  }, [handleLeave]);

  // helper to send message to all peers via data channels (if any)
  const broadcastData = (message: string) => {
    dataChannelsRef.current.forEach((dc) => {
      if (dc.readyState === "open") dc.send(message);
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Beader WebRTC (Multi-peer)</h2>

      <div className="flex gap-4 items-start">
        <div>
          <div className="mb-2">Local</div>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: 300, height: 200, background: "#000" }}
          />
        </div>

        <div>
          <div className="mb-2">Remote peers ({remoteStreams.length})</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {remoteStreams.map((r) => (
              <div key={r.id} style={{ width: 300 }}>
                <div style={{ fontSize: 12, color: "#666" }}>Peer: {r.id}</div>
                <video
                  autoPlay
                  playsInline
                  ref={(el) => {
                    if (el) el.srcObject = r.stream;
                  }}
                  style={{ width: "100%", height: 200, background: "#000" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {!isJoined ? (
          <button onClick={handleJoin} disabled={isLoading} className="px-4 py-2 border">
            {isLoading ? "Joining..." : "Join Call"}
          </button>
        ) : (
          <button onClick={handleLeave} className="px-4 py-2 border">
            Leave
          </button>
        )}

        <button
          onClick={() => broadcastData("Hello from " + (socketRef.current?.id ?? "local"))}
          className="px-4 py-2 border"
        >
          Send Data (to open DCs)
        </button>
      </div>

      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
}