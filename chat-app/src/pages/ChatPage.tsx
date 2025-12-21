import { useAuth0 } from "../authentication/useAuth0Safe";
import LoginButton from "../authentication/LoginButton";
import Chat from "../Chat/Chat";

export default function ChatPage() {
  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated)
    return (
      <div className="p-10 text-white">
        <h1 className="text-2xl font-bold mb-4">Chat Page</h1>
        <p className="mb-4">You must log in first.</p>
        <LoginButton />
      </div>
    );

  
  return (
    <div className="p-5 w-full flex text-white ">
      <a href="/">
        <div>Cavlo</div>
      </a>
      <div className="flex ">
      
      </div>
      <div className="w-full flex justify-center">
        <Chat />

      </div>
      
    </div>
  );
}