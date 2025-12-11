import { useState } from 'react';

function AnimatedButton() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button 
      className="relative bg-transparent border-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Actual text with stroke */}
      <span 
        className="text-[2em] tracking-[3px] uppercase font-['Arial'] text-transparent block"
        style={{
          WebkitTextStroke: '1px rgba(255,255,255,0.6)'
        }}
      >
        &nbsp;Convium&nbsp;
      </span>
      
      {/* Hover text overlay */}
      <span 
        className="absolute top-0 left-0 text-[2em] tracking-[3px] uppercase font-['Arial'] overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          WebkitTextStroke: '1px #37FF8B',
          color: '#37FF8B',
          width: isHovered ? '100%' : '0%',
          borderRight: '6px solid #37FF8B',
          filter: isHovered ? 'drop-shadow(0 0 23px #37FF8B)' : 'none'
        }}
        aria-hidden="true"
      >
        &nbsp;Convium&nbsp;
      </span>
    </button>
  );
}

export default function Header() {
  return (
    <div className="top-0 left-0 right-0 fixed bg-gray-800/25 hover:bg-gray-800/35 w-full backdrop-blur-sm z-50 transition-colors">
      <nav className="flex justify-center p-4">
        <AnimatedButton />
      </nav>
    </div>
  );
}