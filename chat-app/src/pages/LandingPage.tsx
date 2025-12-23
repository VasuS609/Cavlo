import { World } from "../components/ui/globe";
import { useNavigate } from "react-router-dom";
import LandingPageContinue from "./page2";
import { FlipWords } from "../components/ui/flip-words";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "../authentication/LogoutButton";
import UserProfile from "./component/UserProfile";
import Footer from "./footer";
import Page3 from "./page3";
import { TypewriterEffect } from "../components/ui/typewriter-effect";
import { AnimatedModalDemo } from "./component/AnimatedModalDemo";
import { Page4 } from "./Page4";

const words = ["trust", "closeness", "together", "globally"];

const words2 = [
  { text: "One" },
  { text: "Planet." },
  { text: "Infinite" },
  { text: "Conversation" },
];

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
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-[#b1b1b3] via-[#828282] to-[#000000]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#b1b1b3] backdrop-blur-lg border-b border-[#a6a6a6] shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-around items-center h-16">
            <div className="text-white font-bold text-2xl tracking-tight">
              Cavlo
            </div>

            <div className="flex items-center gap-4 min-w-[200px]">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/cavlo")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md"
                  >
                    Cavlo
                  </button>

                  <button
                    onClick={() => navigate("/chat")}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md"
                  >
                    Chat
                  </button>

                  <div className="border-2 border-gray-600 hover:border-gray-400 h-10 w-10 rounded-full cursor-pointer transition-colors">
                    <UserProfile />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="pt-24 pb-16">
        <TypewriterEffect words={words2} className="py-20" />

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="shrink-0">
              <div className="hover:scale-105 duration-700 ease-linear relative rounded-full overflow-hidden shadow-xl w-[320px] h-80 sm:w-[420px] sm:h-[420px] lg:w-[550px] lg:h-[550px]">
                <World globeConfig={defaultGlobeConfig} data={sampleData} />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="text-4xl font-normal text-neutral-100">
                Build <FlipWords words={words} /> <br />
                Where Every Conversation Bridges Continents
              </div>
              <AnimatedModalDemo/>
            </div>
          </div>
        </section>

  
        <section className="max-w-7xl mx-auto px-6 lg:px-8">
          <LandingPageContinue />
        </section>

        <section className="max-w-7xl mx-auto px-6 lg:px-8">
          <Page3 />
          <Page4/>
          <Footer />
        </section>
      </main>
    </div>
  );
}
