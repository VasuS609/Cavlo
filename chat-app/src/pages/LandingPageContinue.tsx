import { WorldMap } from "../components/ui/world-map";
import { CardStack } from "../components/ui/card-stack";


const CARDS = [
  {
    id: 0,
    name: "Manu Arora",
    designation: "Senior Software Engineer",
    content: (
      <p>
        These cards are amazing, I want to use them in my
        project. Framer motion is a godsend ngl tbh fam 🙏
      </p>
    ),
  },
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

export default function LandingPageContinue() {

  

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-[#0f1720] py-16">
      <h2 className="text-3xl font-bold text-white mb-8">Global Network</h2>
      
      <WorldMap
        className="w-full max-w-7xl"
        dots={[
          {
            start: { lat: 64.2008, lng: -149.4937 },
            end: { lat: 34.0522, lng: -118.2437 },
          },
          {
            start: { lat: 64.2008, lng: -149.4937 },
            end: { lat: -20.7975, lng: -47.8919 },
          },
          {
            start: { lat: -20.7975, lng: -47.8919 },
            end: { lat: 38.7223, lng: -9.1393 },
          },
          {
            start: { lat: 51.5074, lng: -0.1278 },
            end: { lat: 28.6139, lng: 77.209 },
          },
          {
            start: { lat: 28.6139, lng: 77.209 },
            end: { lat: 43.1332, lng: 131.9113 },
          },
          {
            start: { lat: 28.6139, lng: 77.209 },
            end: { lat: -1.2921, lng: 36.8219 },
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
      
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Testimonials</h2>
        <CardStack items={CARDS} />
      </div>
    </div>
  );
}
