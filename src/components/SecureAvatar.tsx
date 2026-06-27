import React, { useState } from "react";
import aarshImage from "../../assets/aarshanth.png";

export default function SecureAvatar() {
  const candidates: (string | null)[] = [
    aarshImage,
    "/assets/aarshanth.jpg",
    "/assets/aarshanth.png",
    "/assets/aarshanth.jpeg",
  ];

  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [hasImage, setHasImage] = useState<boolean>(true);

  const imgSrc = candidates[candidateIndex] ?? null;

  // Cycle through candidate URLs on error, then fall back to SVG
  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((i) => i + 1);
    } else {
      setHasImage(false);
    }
  };

  return (
    <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-[3px] overflow-hidden flex items-center justify-center select-none">
      {/* Spinning Gradient Border - uses red and cyan accents for red-teaming vibe */}
      <div className="absolute inset-0 bg-gradient-to-tr from-red-500 via-[#00FF41] to-[#00E5FF] animate-[spin_6s_linear_infinite] rounded-full" />
      
      {/* Inner container */}
      <div className="absolute inset-[3px] rounded-full bg-[#0A0A0A] z-10 flex items-center justify-center overflow-hidden border border-red-500/20">
        {hasImage && imgSrc ? (
          <div className="relative w-full h-full rounded-full overflow-hidden group">
            {/* Real User Image */}
            <img
              src={imgSrc}
              alt="K R Aarshanth"
              onError={handleImageError}
              className="w-full h-full object-cover rounded-full filter contrast-[1.05] brightness-[0.95]"
              referrerPolicy="no-referrer"
            />

            {/* Tactical overlay grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none mix-blend-overlay" />
            
            {/* Green HUD crosshair overlay */}
            <div className="absolute inset-0 border border-red-500/10 rounded-full pointer-events-none" />
            
            {/* Sci-Fi Target corner ticks */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-red-500/60 pointer-events-none" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-red-500/60 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-red-500/60 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-red-500/60 pointer-events-none" />

            {/* Glowing Red active scan line */}
            <div className="absolute left-0 right-0 h-[1.5px] bg-red-500/40 shadow-[0_0_8px_#ef4444] animate-[bounce_4s_infinite] pointer-events-none" />

            {/* Status indicator badge */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-red-950/80 border border-red-500/40 px-1.5 py-0.5 rounded-[1px] text-[7px] font-mono tracking-widest text-red-400 uppercase font-bold whitespace-nowrap shadow-[0_0_6px_rgba(239,68,68,0.3)]">
              RED_TEAM_ID
            </div>
          </div>
        ) : (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full p-2 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Subtle Grid Background */}
            <defs>
              <pattern id="avatar-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(239, 68, 68, 0.05)" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#00FF41" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#avatar-grid)" />

            {/* Radar Circles */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="0.5" strokeDasharray="3,3" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(0, 229, 255, 0.1)" strokeWidth="0.5" />
            
            {/* Outer Shield outline */}
            <path
              d="M50,15 L78,25 L78,55 C78,75 50,88 50,88 C50,88 22,75 22,55 L22,25 Z"
              fill="none"
              stroke="url(#cyber-grad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Digital Nodes */}
            <g className="animate-[pulse_2s_infinite]">
              <circle cx="50" cy="15" r="2.5" fill="#ef4444" />
              <circle cx="78" cy="25" r="2.5" fill="#00FF41" />
              <circle cx="22" cy="25" r="2.5" fill="#00FF41" />
            </g>

            {/* Binary matrix elements */}
            <text x="32" y="40" fill="rgba(239, 68, 68, 0.3)" fontSize="8" fontFamily="monospace">1</text>
            <text x="64" y="40" fill="rgba(0, 255, 65, 0.3)" fontSize="8" fontFamily="monospace">0</text>
            <text x="30" y="68" fill="rgba(0, 255, 65, 0.3)" fontSize="8" fontFamily="monospace">0</text>
            <text x="66" y="68" fill="rgba(239, 68, 68, 0.3)" fontSize="8" fontFamily="monospace">1</text>

            {/* Safe Keyhole in center */}
            <path
              d="M50,38 C44,38 40,42 40,47 C40,51 43,54 46,55.5 L43,70 L57,70 L54,55.5 C57,54 60,51 60,47 C60,42 56,38 50,38 Z"
              fill="url(#cyber-grad)"
              opacity="0.85"
            />
            <circle cx="50" cy="46" r="3" fill="#0A0A0A" />
          </svg>
        )}
      </div>
    </div>
  );
}

