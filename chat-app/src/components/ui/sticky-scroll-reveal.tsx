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
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "#424242", // slate-900
    "#000000", // black
    "#171717", // neutral-900
  ];

  const gradients = [
    "linear-gradient(to bottom right, #06b6d4, #10b981)",
    "linear-gradient(to bottom right, #ec4899, #6366f1)",
    "linear-gradient(to bottom right, #f97316, #eab308)",
  ];

  return (
    <motion.div
      ref={ref}
      animate={{
        backgroundColor:
          backgroundColors[activeCard % backgroundColors.length],
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="relative flex h-120 justify-center space-x-10 overflow-y-auto rounded-md p-10"
    >
      {/* LEFT CONTENT */}
      <div className="relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="text-2xl font-bold text-slate-100"
              >
                {item.title}
              </motion.h2>

              <motion.p
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="mt-10 max-w-sm text-slate-300"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>

      {/* RIGHT STICKY TAB */}
      <motion.div
        animate={{
          background: gradients[activeCard % gradients.length],
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className={cn(
          "sticky top-10 hidden h-60 w-80 overflow-hidden rounded-md lg:block shadow-xl",
          contentClassName,
        )}
      >
        {content[activeCard]?.content}
      </motion.div>
    </motion.div>
  );
};
