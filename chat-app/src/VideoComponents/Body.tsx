import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type RemoteStream = {
  id: string;
  stream: MediaStream;
};

const SIGNALING_SERVER_URL =
  (import.meta as any).env?.VITE_SIGNALING_URL || "http://localhost:8081";

export default function Body() {
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [room, setRoom] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || "default";
  });
  const [isHost, setIsHost] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannelsRef = useRef<Map<string, RTCDataChannel>>(new Map());

  const mediaConstraints: MediaStreamConstraints = {
    audio: true,
    video: true,
  };

  const rtcConfig: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // -------- Helpers --------
  const upsertRemoteStream = (id: string, stream: MediaStream) => {
    setRemoteStreams((prev) => {
      const found = prev.find((r) => r.id === id);
      if (found) {
        return prev.map((r) => (r.id === id ? { ...r, stream } : r));
      }
      return [...prev, { id, stream }];
    });
  };

  const removeRemoteStream = (id: string) => {
    setRemoteStreams((prev) => prev.filter((r) => r.id !== id));
  };

  const createPeerConnection = useCallback(
    (peerId: string, isOfferer: boolean) => {
      if (peersRef.current.has(peerId)) {
        return peersRef.current.get(peerId)!;
      }

      const pc = new RTCPeerConnection(rtcConfig);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) upsertRemoteStream(peerId, stream);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", {
            to: peerId,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) {
          pc.close();
          peersRef.current.delete(peerId);
          dataChannelsRef.current.delete(peerId);
          removeRemoteStream(peerId);
        }
      };

      if (isOfferer) {
        const dc = pc.createDataChannel("chat");
        dc.onopen = () => console.log("DC open with", peerId);
        dc.onmessage = (e) => console.log("Msg from", peerId, e.data);
        dataChannelsRef.current.set(peerId, dc);
      } else {
        pc.ondatachannel = (ev) => {
          const dc = ev.channel;
          dc.onmessage = (e) => console.log("Msg from", peerId, e.data);
          dataChannelsRef.current.set(peerId, dc);
        };
      }

      peersRef.current.set(peerId, pc);
      return pc;
    },
    []
  );

  // -------- Unified setup function --------
  const setupSocketHandlers = useCallback(
    (socket: Socket, amHost: boolean, roomName: string) => {
      const resolvedRoom = roomName || "default";

      socket.emit("join", { room: resolvedRoom, isHost: amHost });

      // 🔹 HOST: When a new user joins, HOST sends offer
      if (amHost) {
        socket.on("new-user", async ({ peerId }: { peerId: string }) => {
          const pc = createPeerConnection(peerId, true);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { to: peerId, sdp: offer });
        });

        // Host should NOT receive "existing-users" (they are first)
      }

      //  GUEST: When joining, receive list of existing peers → but DO NOT offer!
      if (!amHost) {
        socket.on("existing-users", ({ peers }: { peers: string[] }) => {
          // Guest does nothing here — waits for offer from host
          console.log("Existing peers:", peers);
          // Optionally: if multi-user, you might need more logic, but for 1:1, host will offer
        });
      }

      // Handle incoming offer (guest or multi-user)
      socket.on("offer", async ({ from, sdp }) => {
        if (peersRef.current.has(from)) {
          console.warn(`PC already exists for ${from}, ignoring offer`);
          return;
        }
        const pc = createPeerConnection(from, false);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { to: from, sdp: answer });
        } catch (err) {
          console.error("Error handling offer:", err);
        }
      });

      // Handle answer
      socket.on("answer", async ({ from, sdp }) => {
        const pc = peersRef.current.get(from);
        if (!pc) {
          console.warn("No PC for answer from", from);
          return;
        }
        if (pc.signalingState !== "have-local-offer") {
          console.warn(`Ignoring answer: signaling state is ${pc.signalingState}`);
          return;
        }
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        } catch (err) {
          console.error("Failed to set remote answer", err);
        }
      });

      // ICE
      socket.on("ice-candidate", async ({ from, candidate }) => {
        const pc = peersRef.current.get(from);
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error("Error adding ICE candidate", err);
          }
        }
      });

      socket.on("user-left", ({ peerId }: { peerId: string }) => {
        const pc = peersRef.current.get(peerId);
        if (pc) {
          pc.close();
          peersRef.current.delete(peerId);
          dataChannelsRef.current.delete(peerId);
          removeRemoteStream(peerId);
        }
      });
    },
    [createPeerConnection]
  );

  // -------- Start (Host) --------
  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsHost(true);

    const roomName = room.trim();
    if (!roomName) {
      setError("Room name is required");
      setIsLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const socket = io(SIGNALING_SERVER_URL, { transports: ["websocket"] });
      socketRef.current = socket;

      socket.on("connect", () => {
        setupSocketHandlers(socket, true, roomName); // 🔹 I am host
      });

      setIsJoined(true);
    } catch (err: any) {
      setError(err?.message || "Failed to start");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [setupSocketHandlers]);

  // -------- Join (Guest) --------
  const handleJoin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsHost(false);

    const roomName = room.trim();
    if (!roomName) {
      setError("Room name is required");
      setIsLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const socket = io(SIGNALING_SERVER_URL, { transports: ["websocket"] });
      socketRef.current = socket;

      socket.on("connect", () => {
        setupSocketHandlers(socket, false, roomName); // 🔸 I am guest
      });

      setIsJoined(true);
    } catch (err: any) {
      setError(err?.message || "Failed to join");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [setupSocketHandlers]);

  // -------- Leave --------
  const handleLeave = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    dataChannelsRef.current.clear();
    setRemoteStreams([]);

    socketRef.current?.emit("leave-room");
    socketRef.current?.disconnect();
    socketRef.current = null;

    setIsJoined(false);
    setIsHost(false);
  }, []);

  useEffect(() => {
    return () => handleLeave();
  }, [handleLeave]);

  const broadcastData = (msg: string) => {
    dataChannelsRef.current.forEach((dc) => {
      if (dc.readyState === "open") dc.send(msg);
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2 flex ">Cavlo WebRTC</h2>

      <div className="flex gap-4 justify-center">
        <div>
          <div>Local</div>
          <video ref={localVideoRef} autoPlay playsInline muted width={300} />
        </div>

        <div>
          <div>Remote ({remoteStreams.length})</div>
          {remoteStreams.map((r) => (
            <video
              key={r.id}
              autoPlay
              playsInline
              ref={(el) => {
                if (el) el.srcObject = r.stream;
              }}
              width={300}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700" htmlFor="room-input">
            Room
          </label>
          <input
            id="room-input"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="border px-3 py-1 rounded-2xl text-black"
            placeholder="Enter room name"
          />
        </div>

        <div className="flex gap-2 justify-center">
          {!isJoined ? (
            <>
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="border-2 px-3 py-1 rounded-2xl"
              >
                {isLoading && isHost ? "Starting..." : "Start Room"}
              </button>
              <button
                className="border-2 px-3 py-1 rounded-2xl"
                onClick={handleJoin}
                disabled={isLoading}
              >
                {isLoading && !isHost ? "Joining..." : "Join"}
              </button>
            </>
          ) : (
            <button className="border-2 px-3 py-1 rounded-2xl" onClick={handleLeave}>
              Leave
            </button>
          )}

          <button
            onClick={() => broadcastData("Hello from peer")}
            disabled={!isJoined}
            className="border-2 px-3 py-1 rounded-2xl disabled:opacity-50"
          >
            Send Data
          </button>
        </div>

        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}