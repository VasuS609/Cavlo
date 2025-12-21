import { World } from "../components/ui/globe";
import { useNavigate } from "react-router-dom";
import LandingPageContinue from "./page2";
import { FlipWords } from "../components/ui/flip-words";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "../authentication/LogoutButton"
import UserProfile from "./component/UserProfile";
import Footer from "./footer";
import Page3 from "./page3";
import { TypewriterEffect } from "../components/ui/typewriter-effect";


const words = ["trust", "closeness", "together", "globally"];

 const words2 = [
    {
      text: "One",
    },
    {
      text: "Planet.",
    },
    {
      text: "Infinite",
    },
    {
      text: "Conversation",
    }
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
  const {isAuthenticated, loginWithRedirect } = useAuth0();
  

  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-[#58585a] via-[#626364] to-[#7a8fcc]">
      {/* Navbar */}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#464647] backdrop-blur-lg border-b border-[#58585a] shadow-lg">      
      

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-around items-center h-16">
            {/* Logo */}
            <div className="text-white font-bold text-2xl tracking-tight">
              Cavlo
            </div>

          

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                 <div className="gap-4">
                  {/* navigating button */}
                 
              <button
                onClick={() => navigate("/cavlo")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-purple-500/50"
              >
                Cavlo
              </button>

               <button
                onClick={() => navigate("/chat")}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-purple-500/50"
              >
                Chat
              </button>

               <div className="border-2 border-gray-600 hover:border-gray-400 h-10 w-10 rounded-full transition-colors duration-200 cursor-pointer" >
                <UserProfile/>
              </div>
              <LogoutButton/>
              </div>

              ):(
                 <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-blue-500/50"
              >
                Login
              </button>
              )}
                      
 
             
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
           <TypewriterEffect words={words2} className="py-20"/>
        {/* Hero Section with Globe */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            {/* Globe */}
            <div className="shrink-0">
              <div
                className="relative rounded-full overflow-hidden shadow-2xl"
                style={{ width: "550px", height: "550px" }}
              >
                <World globeConfig={defaultGlobeConfig} data={sampleData} />
              </div>
            </div>

            {/* Hero Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="text-4xl mx-auto font-normal text-neutral-300 dark:text-neutral-200">
                Build <FlipWords words={words} /> <br />
                Where Every Conversation Bridges Continents
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <hr className="border-gray-600 my-16" />
        </div>

        {/* Continue Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8">
          <LandingPageContinue />
        </section>
        <section className="max-w-7xl mx-auto px-6 lg:px-8">
          <Page3/>
          <Footer/>
        </section>
      </main>
    </div>
  );
}