import React, { useEffect, useState, useRef } from "react";

interface ScrambleTextProps {
  text: string;
  trigger: boolean;
  duration?: number;
  className?: string;
}

export default function ScrambleText({ text, trigger, duration = 800, className = "" }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) {
      setDisplayText(text);
      return;
    }

    const chars = "01X[]*!&@#%?_";
    const original = text;
    const maxFrames = Math.floor(duration / 16);
    let frame = 0;

    const tick = () => {
      frame++;
      const progress = frame / maxFrames;
      let result = "";

      for (let i = 0; i < original.length; i++) {
        if (original[i] === " ") {
          result += " ";
        } else if (i / original.length < progress) {
          result += original[i];
        } else {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      setDisplayText(result);

      if (frame < maxFrames) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayText(original);
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [text, trigger, duration]);

  return <span className={className}>{displayText}</span>;
}
