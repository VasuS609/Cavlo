import { useCallback, useEffect, useRef, useState } from "react";

export default function Beader() {
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fix: Define dataChannelSendRef properly
  const dataChannelSendRef = useRef<HTMLTextAreaElement>(null);

  const mediaStreamConstraint = {
    audio: true,
    video: true,
  };

  // ICE servers
  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Use useRef properly (not let + reassignment)
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  //  Define event handlers (needed in createConnection)
  const handleConnection = (event: RTCPeerConnectionIceEvent) => {
    console.log("ICE Candidate:", event.candidate);
  };

  const handleConnectionChange = () => {
    console.log("ICE Connection State:", peerConnectionRef.current?.iceConnectionState);
  };

  // Create connection logic
  const createConnection = useCallback((): void => {
    if (dataChannelSendRef.current) {
      dataChannelSendRef.current.placeholder = "";
    }

    // Create new RTCPeerConnection
    const pc = new RTCPeerConnection(servers);
    peerConnectionRef.current = pc;

    // Add event listeners
    pc.addEventListener("icecandidate", handleConnection);
    pc.addEventListener("iceconnectionstatechange", handleConnectionChange);

    // Optional: attach to window for debugging (not recommended in production)
    // (window as any).localConnection = pc;
  }, []);

  // Set up connection on mount
  useEffect(() => {
    createConnection();
  }, [createConnection]);

  //  Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.removeEventListener("icecandidate", handleConnection);
        peerConnectionRef.current.removeEventListener("iceconnectionstatechange", handleConnectionChange);
        peerConnectionRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Handle local media stream
  const gotLocalMediaStream = (mediaStream: MediaStream) => {
    localStreamRef.current = mediaStream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream;
    }
  };

  //  Call handler
  const handleCall = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraint);
      gotLocalMediaStream(stream);

      const pc = new RTCPeerConnection(servers);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      setIsJoined(true);
    } catch (err: any) {
      console.error("Call failed:", err);
      setError(err.message || "Failed to access camera/mic");
    } finally {
      setIsLoading(false);
    }
  }, []);

  //  Leave handler
  const handleLeave = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setIsJoined(false);
  }, []);

  return (
    <div className="mt-70 w-full h-screen p-2">
      <div className="flex gap-6">
        <div className="border" id="localVideo">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            style={{ width: "300px", border: "1px solid #ccc" }}
          />
        </div>
        <div className="border" id="remoteVideo">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: "300px", border: "1px solid #ccc" }}
          />
        </div>
      </div>

      {/*  Fix: Only one textarea, properly closed */}
      <textarea
        ref={dataChannelSendRef}
        disabled
        placeholder="Press Start, enter some text, then press Send."
        style={{ width: "100%", height: "80px", marginTop: "16px" }}
      />

      {/* Button section */}
      <div className="mt-4 flex justify-between">
        {isJoined ? (
          <button
            onClick={handleLeave}
            disabled={isLoading}
            className="border-2 px-4 py-2 rounded-2xl"
          >
            Leave
          </button>
        ) : (
          <button
            onClick={handleCall}
            disabled={isLoading}
            className="border-2 px-4 py-2 rounded-2xl"
          >
            {isLoading ? "Joining..." : "Join Call"}
          </button>
        )}
      </div>

      {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
    </div>
  );
}