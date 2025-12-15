import { World } from "../components/ui/globe";
import { EncryptedText } from "../components/ui/encrypted-text";
import { useNavigate } from "react-router-dom";
import LandingPageContinue from "./LandingPageContinue";

const defaultGlobeConfig = {
  pointSize: 1,
  globeColor: "#1d072e",
  showAtmosphere: false,
  atmosphereColor: "#586aa8",
  atmosphereAltitude: 0.1,
  emissive: "#000000",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#ffffff",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 2000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 20, lng: 0 },
  autoRotate: true,
  autoRotateSpeed: 0.4,
};

const sampleData = [
  {
    order: 1,
    startLat: 37.7749,
    startLng: -122.4194,
    endLat: 51.5074,
    endLng: -0.1278,
    arcAlt: 0.6,
    color: "#ff0000",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center bg-[#0f1720] py-8">
    {/* navbar */}
      <div className="flex justify-end pr-10 w-full mb-8 fixed top-0 right-0 z-50">
        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-white text-black px-4 py-2 rounded"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/cavlo")}
          className="mt-4 bg-white text-black px-4 py-2 rounded"
        >
          Cavlo
        </button>
      </div>  
      <EncryptedText
        className="text-xl font-mono font-semibold mb-8 mt-16"
        text="Welcome to the Matrix, Cavlo"/>

      <div
        style={{
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        
        <World globeConfig={defaultGlobeConfig} data={sampleData} />

      </div>
      
<hr className="border-gray-400 border-t-2 my-4"></hr>
     
     <LandingPageContinue/>
     </div>
     
 
  );
}
