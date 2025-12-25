import { WorldMap } from "../components/ui/world-map";
import { EncryptedText } from "../components/ui/encrypted-text";
import { StickyScroll } from "../components/ui/sticky-scroll-reveal";
import { AnimatedTooltip } from "../components/ui/animated-tooltip";

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
    title: "Real-Time Changes",
    description:
      "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] text-white">
        Real-Time Sync
      </div>
    ),
  },
  {
    title: "Built for the Whole World",
    description:
      "Support for 50+ languages, low-bandwidth mode for rural areas, and accessibility-first design—because great communication includes everyone. From Tokyo boardrooms to Nairobi co-working spaces, you’re welcome here.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--purple-500),var(--pink-500))] text-white">
        Global & Inclusive
      </div>
    ),
  },
  {
    title: "Face-to-Face Across Continents", // ✅ Fixed duplicate title
    description:
      "Meet face-to-face from Mumbai to Mexico City. Our video conferencing brings people together across continents with crystal-clear audio, HD video, and zero lag—so distance never dims your connection.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--blue-500),var(--indigo-500))] text-white">
        Global Video Calls
      </div>
    ),
  },
];

const people = [
  {
    id: 1,
    name: "John Doe",
    designation: "Software Engineer",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
  },
  {
    id: 2,
    name: "Robert Johnson",
    designation: "Product Manager",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    name: "Jane Smith",
    designation: "Data Scientist",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 4,
    name: "Emily Davis",
    designation: "UX Designer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 5,
    name: "Tyler Durden",
    designation: "Soap Developer",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
  },
  {
    id: 6,
    name: "Dora",
    designation: "The Explorer",
    image:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80",
  },
];

export default function Page2() {
  return (
    <div className="w-full rounded-3xl min-h-screen flex  flex-col justify-center items-center pt-5 mb-10">
      {/* Center Text */}
        <div className="w-full px-4 mb-16">
  <div className="moving-border-card w-full max-w-6xl mx-auto rounded-3xl text-center font-sans antialiased relative ease-linear duration-900 hover:scale-105 hover:shadow-3xl shadow-2xl shadow-neutral-600 p-12 md:p-16">
    <p className="text-black text-lg lg:text-xl leading-relaxed">
      Join millions across 190+ countries speaking, laughing, brainstorming, and building—
      <EncryptedText
        text=" face-to-face, voice-to-voice, heartbeat-to-heartbeat—in stunning clarity."
      />
    </p>
    <div className="flex flex-row items-center justify-center pt-12 md:pt-16 flex-wrap gap-2">
      <AnimatedTooltip items={people} />
    </div>
  </div>
</div>
<div>
 
 
</div>
<div>
</div>
<div className="flex md:w-full items-center w-full min-w-7xl py-5 gap-5 mt-3">

     <WorldMap className="hover:scale-105 duration-600 ease-linear"       
        dots={[
          { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: 34.0522, lng: -118.2437 } }, // Alaska → LA
          { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: -15.7975, lng: -47.8919 } }, // Alaska → Brazil
          { start: { lat: -15.7975, lng: -47.8919 }, end: { lat: 38.7223, lng: -9.1393 } }, // Brazil → Lisbon
          { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 28.6139, lng: 77.209 } }, // London → Delhi
          { start: { lat: 28.6139, lng: 77.209 }, end: { lat: 43.1332, lng: 131.9113 } }, // Delhi → Vladivostok
          { start: { lat: 28.6139, lng: 77.209 }, end: { lat: -1.2921, lng: 36.8219 } }, // Delhi → Nairobi
          { start: { lat: 28.6139, lng: 77.209 }, end: { lat: -35.2809, lng: 149.13 } }, // Delhi → Canberra
          { start: { lat: 28.6139, lng: 77.209 }, end: { lat: -15.7939, lng: -47.8828 } }, // Delhi → Brasília
        ]}
      />

      <StickyScroll content={content} />
</div>
   
    </div>
  );
}