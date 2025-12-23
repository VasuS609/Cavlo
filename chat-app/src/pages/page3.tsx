import video from "./component/video.mp4";

export default function Page3() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden mb-10 shadow-2xl ">

      {/* 🔹 Background Video */}
      <video
        src={video}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />

      {/* 🔹 Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 🔹 Overlay Content */}
      <div className="relative z-10 flex items-center h-screen px-16">
        <article className="max-w-xl bg-white/70 dark:bg-black/20 p-6 rounded-lg shadow-lg backdrop-blur-md text-black dark:text-white hover:scale-105 transition-transform duration-500 ease-linear">

          <time className="text-sm opacity-70">Mar 10, 2020</time>

          <h3 className="mt-2 text-2xl font-bold">
            The Invisible Threads That Bind Us
          </h3>

          <p className="mt-4 text-sm leading-relaxed">
            Every second, 65,000 GB of data flows across the planet. From a farmer
            in Kenya checking crop prices to a doctor in Tokyo consulting AI
            diagnostics — humanity is woven into a single neural network.
          </p>

          <ul className="mt-3 list-disc list-inside text-sm">
            <li>
              Fiber-optic cables snaking across ocean floors (99% of intercontinental data!)
            </li>
          </ul>

          {/* 🔹 Author */}
          <div className="mt-6 flex items-center gap-3">
            <img
              src="/img/lindsay.jpg"
              alt="Lindsay Walton"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-sm font-medium">Lindsay Walton</span>
          </div>

        </article>
      </div>

    </div>
  );
}
