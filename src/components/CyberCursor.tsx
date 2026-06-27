import React, { useEffect, useState, useRef } from "react";

export default function CyberCursor() {
  const [isHovered, setIsHovered] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const requestRef = useRef<number | null>(null);
  const currentPos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const angleRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".pc-wrap") ||
        target.closest(".interactive-cyber-element")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    const updateLerp = () => {
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;
      
      // Smooth lerp following
      currentPos.current.x += dx * 0.15;
      currentPos.current.y += dy * 0.15;
      
      angleRef.current = (angleRef.current + 0.5) % 360;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%) rotate(${angleRef.current}deg)`;
      }

      requestRef.current = requestAnimationFrame(updateLerp);
    };

    requestRef.current = requestAnimationFrame(updateLerp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      {/* Precision Inner Dot */}
      <div
        ref={dotRef}
        className="fixed left-0 top-0 w-1.5 h-1.5 bg-[#00FF41] rounded-full pointer-events-none z-[99999] transition-shadow duration-300 will-change-transform"
        style={{
          boxShadow: isHovered
            ? "0 0 12px #00E5FF"
            : "0 0 8px #00FF41",
          backgroundColor: isHovered ? "#00E5FF" : "#00FF41",
          transform: "translate3d(-100px, -100px, 0)", // Offscreen initially
        }}
      />

      {/* Lag-following outer ring with corner brackets */}
      <div
        ref={ringRef}
        className="fixed left-0 top-0 pointer-events-none z-[99998] transition-[width,height] duration-200 ease-out will-change-transform"
        style={{
          width: isHovered ? "48px" : "32px",
          height: isHovered ? "48px" : "32px",
          transform: "translate3d(-100px, -100px, 0)", // Offscreen initially
        }}
      >
        {/* Corner Brackets */}
        <span
          className="absolute top-0 left-0 w-2 h-2 border-t-1.5 border-l-1.5 transition-colors duration-300"
          style={{ borderColor: isHovered ? "#00E5FF" : "#00FF41" }}
        />
        <span
          className="absolute top-0 right-0 w-2 h-2 border-t-1.5 border-r-1.5 transition-colors duration-300"
          style={{ borderColor: isHovered ? "#00E5FF" : "#00FF41" }}
        />
        <span
          className="absolute bottom-0 left-0 w-2 h-2 border-b-1.5 border-l-1.5 transition-colors duration-300"
          style={{ borderColor: isHovered ? "#00E5FF" : "#00FF41" }}
        />
        <span
          className="absolute bottom-0 right-0 w-2 h-2 border-b-1.5 border-r-1.5 transition-colors duration-300"
          style={{ borderColor: isHovered ? "#00E5FF" : "#00FF41" }}
        />

        {/* Outer Ring Scanning Line */}
        <span
          className="absolute left-0.5 right-0.5 h-[1px] opacity-40"
          style={{
            background: isHovered ? "rgba(0, 229, 255, 0.4)" : "rgba(0, 255, 65, 0.4)",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </>
  );
}
