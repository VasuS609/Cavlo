import { useEffect, useRef } from 'react';
import { signalingService } from './SignalingService';

type VideoCallProps = {
  roomId: string;
  userId: string;
};

export const VideoCallComponent = ({ roomId, userId }: VideoCallProps) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Connect signaling
    signalingService.connect(roomId, userId);
    signalingService.on('error', (err) => {
      console.error('Signaling error:', err);
    });

    const initializeConnection = async () => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });

        peerConnectionRef.current = pc;

        // ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendIceCandidate(event.candidate);
          }
        };

        // Remote track
        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Connection state changes
        pc.onconnectionstatechange = () => {
          console.log('Connection state:', pc.connectionState);
          if (pc.connectionState === 'failed') {
            handleConnectionFailure();
          }
        };

        // Local media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      } catch (error) {
        console.error('Failed to initialize connection:', error);
        handleInitializationError(error as Error);
      }
    };

    initializeConnection();

    return () => {
      signalingService.disconnect();
      signalingService.off('error');
      cleanupConnection();
    };
  }, [roomId, userId]);

  const cleanupConnection = () => {
    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } finally {
        peerConnectionRef.current = null;
      }
    }

    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const sendIceCandidate = (candidate: RTCIceCandidate) => {
    signalingService.sendMessage({ type: 'candidate', candidate });
  };

  const handleConnectionFailure = () => {
    console.log('Connection failed, attempting to reconnect...');
    cleanupConnection();
    // Optional: trigger reconnection with backoff
  };

  const handleInitializationError = (error: Error) => {
    console.error('Initialization error:', error);
    alert('Failed to start video call. Please check your camera and microphone permissions.');
  };

  return (
    <div>
      {/* Remote video */}
      <video ref={remoteVideoRef} autoPlay playsInline />

      {/* Local video */}
      <video
        ref={(el) => {
          if (el && localStreamRef.current) el.srcObject = localStreamRef.current;
        }}
        autoPlay
        muted
        playsInline
      />
    </div>
  );
};
