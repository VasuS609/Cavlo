import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import CallbackPage from "./authentication/CallbackPage";
import ChatPage from "./pages/ChatPage";
import Cavlo from "./Cavlo/cavlo";
import Body from "./room/[roomId]/Room";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/cavlo" element={<Cavlo />} />
      <Route path="/cavlo/:roomId" element={<Body/>} />
    </Routes>
  );
}
