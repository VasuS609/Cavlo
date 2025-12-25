"use client";
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "../../components/ui/animated-modal";
import { motion } from "motion/react";
import LoginButton from "../../authentication/LoginButton";

export function AnimatedModalDemo() {
  const {isAuthenticated} = useAuth0();

 const worldImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3000&auto=format&fit=crop", // Earth from space
  "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=3000&auto=format&fit=crop", // World map
  "https://images.unsplash.com/photo-1529539240468-3c8527a5a086?q=80&w=3000&auto=format&fit=crop", // Globe
  "https://images.unsplash.com/photo-1549060224-760438a47088?q=80&w=3000&auto=format&fit=crop", // People video call ✅
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=3000&auto=format&fit=crop", // Diverse team meeting ✅
];
  return (
    <div className="-mt-8 ml-10 flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white/90 dark:text-black shadow-xl text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-80 text-center transition duration-800">
            Start Your Global Conversation
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-1000 text-white z-20">
            🌍
          </div>
        </ModalTrigger>
        <ModalBody>
          <ModalContent>
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-6">
              Connect with anyone, anywhere—<br />
              in real time.{" "}
              <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                No borders. Just conversation.
              </span>
            </h4>

            <div className="flex justify-center items-center">
              {worldImages.map((image, idx) => (
                <motion.div
                  key={"world" + idx}
                  style={{
                    rotate: Math.random() * 20 - 10,
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 0,
                    zIndex: 100,
                  }}
                  whileTap={{
                    scale: 1.1,
                    rotate: 0,
                    zIndex: 100,
                  }}
                  className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 shrink-0 overflow-hidden"
                >
                  <img
                    src={image}
                    alt="Global connection visuals"
                    className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
                  />
                </motion.div>
              ))}
            </div>

            <div className="py-8 flex flex-wrap gap-x-4 gap-y-4 items-start justify-center max-w-sm mx-auto">
              <FeatureItem icon={<GlobeIcon />} text="190+ countries" />
              <FeatureItem icon={<VideoIcon />} text="HD video calls" />
              <FeatureItem icon={<UsersIcon />} text="Group rooms" />
              <FeatureItem icon={<ClockIcon />} text="24/7 availability" />
              <FeatureItem icon={<TranslateIcon />} text="Live translation" />
              <FeatureItem icon={<ShieldIcon />} text="End-to-end encryption" />
            </div>
          </ModalContent>

          <ModalFooter className="gap-4">
            {isAuthenticated? (
              <div>

              
               <button className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28">
              Later
            </button>
            <button className="bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28">
              Join Now
            </button>
            </div>
            ):(
              <LoginButton/>
            )}
           
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
}

// ----- Reusable Feature Item -----
const FeatureItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center justify-center">
    <span className="mr-1 text-neutral-700 dark:text-neutral-300">{icon}</span>
    <span className="text-neutral-700 dark:text-neutral-300 text-sm">{text}</span>
  </div>
);

// ----- Updated Icons (World / Communication Theme) -----
const GlobeIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H11v8H3.055l-.002-.001zm17.945 0H13v8h7.945l.002-.001zM12 4a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
  </svg>
);

const VideoIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ClockIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TranslateIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M3 9h18M3 13h18M3 17h12" />
  </svg>
);

const ShieldIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);