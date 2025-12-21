"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, motion } from "motion/react";
import { cn } from "../../lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });

  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) =>
        Math.abs(latest - breakpoint) <
        Math.abs(latest - cardsBreakpoints[acc])
          ? index
          : acc,
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <motion.div
      ref={ref}
      animate={{ backgroundColor: "#6b7280" }} // MATCHED BACKGROUND
      className="relative flex h-120 justify-center space-x-10 overflow-y-auto rounded-md p-10"
    >
      {/* LEFT CONTENT */}
      <div className="relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                animate={{ opacity: activeCard === index ? 1 : 0.4 }}
                className="text-2xl font-bold text-white"
              >
                {item.title}
              </motion.h2>
              <motion.p
                animate={{ opacity: activeCard === index ? 1 : 0.4 }}
                className="mt-6 max-w-sm text-white/80"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>

      {/* RIGHT TAB */}
      <div
        className={cn(
          "sticky top-10 hidden h-60 w-80 rounded-md bg-[#6b7280] lg:block",
          contentClassName,
        )}
      >
        {content[activeCard]?.content}
      </div>
    </motion.div>
  );
};
