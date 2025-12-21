import { WorldMap } from "../components/ui/world-map";

import { EncryptedText } from "../components/ui/encrypted-text";
import { CardStack } from "../components/ui/card-stack";
import { StickyScroll } from "../components/ui/sticky-scroll-reveal";


const CARDS = [
  
  {
    id: 1,
    name: "Elon Musk",
    designation: "Senior Shitposter",
    content: (
      <p>
        I dont like this Twitter thing,{" "}
        deleting it right away because yolo. Instead, I
        would like to call it X.com so that it can easily
        be confused with adult sites.
      </p>
    ),
  },
  {
    id: 2,
    name: "Tyler Durden",
    designation: "Manager Project Mayhem",
    content: (
      <p>
        The first rule of
      Fight Club is that you do not talk about fight
        club. The second rule of
        Fight club is that you DO NOT TALK about fight
        club.
      </p>
    ),
  },
];


const content = [
  {
    title: "The Globe Comes Alive",
    description:
      "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
        Collaborative Editing
      </div>
    ),
  },
  {
    title: "Real time changes",
    description:
      "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] text-white">
        Real Time Changes
      </div>
    ),
  },
  {
    title: "Built for the Whole World",
    description:
      "Support for 50+ languages, low-bandwidth mode for rural areas, and accessibility-first design—because great communication includes everyone. From Tokyo boardrooms to Nairobi co-working spaces, you’re welcome here.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] text-white">
        Built for the Whole World
      </div>
    ),
  },
  {
    title: "The Globe Comes Alive",
    description:
     "Meet face-to-face from Mumbai to Mexico City. Our video conferencing brings people together across continents with crystal-clear audio, HD video, and zero lag—so distance never dims your connection.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
        The Globe Comes Alive
      </div>
    ),
  },
];
 const words = [
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

export default function LandingPageContinue() {

  

  return (
    <div className="w-full rounded-3xl min-h-screen flex flex-col justify-center items-center py-15">
     {/* Center Text */}
            <div className="hidden md:block text-center text-2xl font-sans antialiased">
              <p className="indent-5"> 
            Join millions across 190+ countries speaking, laughing, brainstorming, and building—
            </p>
              <EncryptedText
                
                text=" face-to-face, voice-to-voice, heartbeat-to-heartbeat—in stunning clarity."
              />
            </div>

          
      <WorldMap
        className="w-full min-w-7xl py-5 -mt-20" 
        dots={[
          {
            start: {
              lat: 64.2008,
              lng: -149.4937,
            }, // Alaska (Fairbanks)
            end: {
              lat: 34.0522,
              lng: -118.2437,
            }, // Los Angeles
          },
          {
            start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
            end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
          },
          {
            start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
            end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
          },
          {
            start: { lat: 51.5074, lng: -0.1278 }, // London
            end: { lat: 28.6139, lng: 77.209 }, // New Delhi
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
          },
          {
            start: { lat: 28.6139, lng: 77.209 },
            end: { lat: -35.2809, lng: 149.1300 }, // Canberra (fixed coords)
          },
          {
            start: { lat: 28.6139, lng: 77.209 },
            end: { lat: -15.7939, lng: -47.8828 }, // Brasília
          },
        ]}
      />
 
       <StickyScroll content={content}/>
         <hr className="border-gray-600 my-16" />
    </div>
  );
}
