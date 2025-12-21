import { useNavigate } from "react-router-dom";

export default function ChatButton() {
  const navigate = useNavigate();

  const handleChat = () => {
    console.log("redirected to chat section");
    navigate("/");
  };

  return (
    <button 
      onClick={handleChat} 
      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
    >
      Bcak to landing Page
    </button>
  );
}