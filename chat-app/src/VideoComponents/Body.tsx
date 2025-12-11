import { useCallback, useEffect, useRef, useState } from "react"

export default function Beader(){
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mediaConstraint = {
    audio:true,
    video:true
  }

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef= useRef<RTCPeerConnection | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);


  const handleCall = useCallback(async ()=>{
       setIsLoading(true);
    setError(null);
    try{

    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraint);
    if(localVideoRef.current){
      localVideoRef.current.srcObject = stream
    }
    localStreamRef.current = stream;
    setIsJoined(true);
    
    const pc =new RTCPeerConnection({
    //icen candidate
    iceServers:[{urls:'stun:stun.l.google.com:19302'}]
  })

  peerConnectionRef.current =pc;
stream.getTracks().forEach(track => pc.addTrack(track, stream));

pc.ontrack = (event)=>{
  if(remoteVideoRef.current){
    remoteVideoRef.current.srcObject = event.streams[0];
  }
};
setIsJoined(true);



  }catch(err:any){
     console.error("Call failed:", err);
      setError(err.message || "Failed to access camera/mic");
  }
  }, [])

  const handleLeave = useCallback(async ()=>{
    
    if(localStreamRef.current){
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
  }

    if(peerConnectionRef.current){
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      setIsJoined(false);
    }
    if(localVideoRef.current) localVideoRef.current.srcObject = null;
    if(remoteVideoRef.current) remoteVideoRef.current.srcObject = null; 
    setIsJoined(false);
  }, [])

  useEffect(()=>{
    return() =>{
      if(localStreamRef.current) localStreamRef.current.getTracks().forEach((track)=>{track.stop()})
      if(peerConnectionRef.current) peerConnectionRef.current.close()
    }
  }, [])
  

  return (
    <div className="w-full h-sreen p-2">
      <div className="flex gap-6">
        <div className=" border bor" id="localVideo">
          <video ref={localVideoRef}
          autoPlay
          playsInline
    style={{ width: '300px', border: '1px solid #ccc' }}
         />
        </div>
        <div className="border bor" id="remoteVideo">
          <video ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: '300px', border: '1px solid #ccc' }}
          />
        </div>
      </div>
      <div className="mt-4 w-100 flex  justify-between">
        {isJoined? (
                 <button onClick={handleLeave} disabled={isLoading} className="border-2  px-4 py-2 rounded-2xl">Leave</button> 
        ):(
     <button onClick={handleCall} className="border-2  px-4 py-2 rounded-2xl" disabled={isLoading} >  {isLoading ? 'Joining...' : 'Join Call'}</button>

        )}
        {/* <button onClick={handleCall} className="border-2  px-4 py-2 rounded-2xl">Call</button> */}
   
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}