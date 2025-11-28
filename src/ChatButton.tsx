import Chat from "./Chat";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

export default function ChatButton() {
  const navigate = useNavigate();

  const handleChat = () => {
    console.log("redirected to chat section");
    navigate("/chat"); // redirect to Chat page
  };

  return (
    <>


      <div>
        <button onClick={handleChat} className="button chat">
          Chat button
        </button>
      </div>
    </>
  );
}
