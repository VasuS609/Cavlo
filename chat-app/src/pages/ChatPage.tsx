import { useAuth0 } from "../authentication/useAuth0Safe";
import LoginButton from "../authentication/LoginButton";
import Chat from "../Chat/Chat";

export default function ChatPage() {
  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated)
    return (
      <div className="min-h-screen bg-linear-to-b from-[#0f0f12] via-[#141620] to-[#1a1e27] flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2">Chat Page</h1>
          <p className="mb-6 text-neutral-300">You must log in first.</p>
          <LoginButton />
        </div>
      </div>
    );

  
  return (
    <div className="min-h-screen bg-linear-to-b from-[#0f0f12] via-[#141620] to-[#1a1e27] p-6 text-white">
      <header className="flex items-center justify-between mb-6">
        <a href="/" className="text-lg font-semibold hover:opacity-80 transition-opacity">Cavlo</a>
      </header>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-5xl rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-3 shadow-2xl">
          <Chat />
        </div>
      </div>
    </div>
  );
}