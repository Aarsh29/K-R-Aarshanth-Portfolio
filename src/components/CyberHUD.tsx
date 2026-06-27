import React, { useEffect, useState } from "react";

export default function CyberHUD() {
  const [sysTime, setSysTime] = useState("");
  const [entropy, setEntropy] = useState("0x4A8E");
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(28);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSysTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Dynamic entropy change
    const entropyInterval = setInterval(() => {
      const hex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, "0");
      setEntropy(`0x${hex}`);
    }, 3000);

    // Live FPS calculator using requestAnimationFrame
    let frameCount = 0;
    let lastTime = performance.now();
    let rId: number;

    const tick = () => {
      frameCount++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        const calculatedFps = Math.round((frameCount * 1000) / (now - lastTime));
        // clamp FPS values to typical refresh rates if slight browser timer anomalies occur
        setFps(Math.min(calculatedFps, 120));
        frameCount = 0;
        lastTime = now;
      }
      rId = requestAnimationFrame(tick);
    };

    rId = requestAnimationFrame(tick);

    // Simulated latency tracker with realistic jitter
    const latencyInterval = setInterval(() => {
      const base = 21;
      const jitter = Math.floor(Math.random() * 11);
      setLatency(base + jitter);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(entropyInterval);
      cancelAnimationFrame(rId);
      clearInterval(latencyInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-[2] pointer-events-none overflow-hidden select-none">
      {/* 1. Center Radar HUD Element */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[500px] md:h-[500px] opacity-[0.22] transition-opacity duration-500">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full text-[#00FF41]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="radar-sweep-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="rgba(0, 255, 65, 0.15)" />
              <stop offset="70%" stopColor="rgba(0, 255, 65, 0.05)" />
              <stop offset="100%" stopColor="rgba(0, 255, 65, 0)" />
            </radialGradient>
            <linearGradient id="hud-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FF41" />
              <stop offset="100%" stopColor="#00E5FF" />
            </linearGradient>
          </defs>

          {/* Core Central Dot */}
          <circle cx="100" cy="100" r="1.5" fill="url(#hud-glow)" />

          {/* Static Concentric Circles */}
          <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1,1" />
          <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="0.25" opacity="0.6" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4,3" opacity="0.8" />
          <circle cx="100" cy="100" r="95" fill="none" stroke="url(#hud-glow)" strokeWidth="0.5" opacity="0.4" />

          {/* Compass Crosshairs */}
          <line x1="100" y1="5" x2="100" y2="195" stroke="currentColor" strokeWidth="0.2" opacity="0.4" strokeDasharray="2,4" />
          <line x1="5" y1="100" x2="195" y2="100" stroke="currentColor" strokeWidth="0.2" opacity="0.4" strokeDasharray="2,4" />

          {/* Angle Notch Markers (30, 60, 120, etc.) */}
          <g opacity="0.5" stroke="currentColor" strokeWidth="0.25">
            <line x1="100" y1="90" x2="100" y2="88" transform="rotate(30, 100, 100)" />
            <line x1="100" y1="90" x2="100" y2="88" transform="rotate(60, 100, 100)" />
            <line x1="100" y1="90" x2="100" y2="88" transform="rotate(120, 100, 100)" />
            <line x1="100" y1="90" x2="100" y2="88" transform="rotate(150, 100, 100)" />
            <line x1="100" y1="90" x2="100" y2="88" transform="rotate(210, 100, 100)" />
            <line x1="100" y1="90" x2="100" y2="88" transform="rotate(240, 100, 100)" />
            <line x1="100" y1="90" x2="100" y2="88" transform="rotate(300, 100, 100)" />
            <line x1="100" y1="90" x2="100" y2="88" transform="rotate(330, 100, 100)" />
          </g>

          {/* Spinning Tech Ring outer */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="0.4"
            strokeDasharray="15,40,5,10"
            className="animate-[spin_35s_linear_infinite]"
            opacity="0.8"
          />

          {/* Spinning Tech Ring inner */}
          <circle
            cx="100"
            cy="100"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
            strokeDasharray="40,15,5,5"
            className="animate-[spin_18s_linear_infinite_reverse]"
            opacity="0.75"
          />

          {/* Radar Sweep Arc */}
          <g className="animate-[spin_12s_linear_infinite]">
            <path
              d="M 100 100 L 100 5 A 95 95 0 0 1 182.27 52.5 Z"
              fill="url(#radar-sweep-grad)"
            />
            <line x1="100" y1="100" x2="100" y2="5" stroke="currentColor" strokeWidth="0.5" opacity="0.9" />
          </g>

          {/* Technical labels inside circle */}
          <text x="105" y="15" fill="currentColor" fontSize="3" opacity="0.4" fontFamily="monospace">000° SECURE</text>
          <text x="184" y="103" fill="currentColor" fontSize="3" opacity="0.4" fontFamily="monospace">090° SYSTEM</text>
          <text x="105" y="190" fill="currentColor" fontSize="3" opacity="0.4" fontFamily="monospace">180° STABLE</text>
          <text x="8" y="103" fill="currentColor" fontSize="3" opacity="0.4" fontFamily="monospace">270° FIREWALL</text>

          {/* Active Cyber Target Reticles */}
          <g stroke="currentColor" strokeWidth="0.3" fill="none">
            {/* Target 1 */}
            <g transform="translate(145, 75)" className="animate-pulse">
              <circle cx="0" cy="0" r="3" stroke="#00E5FF" />
              <line x1="-5" y1="0" x2="5" y2="0" stroke="#00E5FF" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#00E5FF" />
              <text x="5" y="-5" fill="#00E5FF" fontSize="2.5" fontFamily="monospace">THREAT_0</text>
            </g>
            {/* Target 2 */}
            <g transform="translate(60, 130)">
              <circle cx="0" cy="0" r="2.5" />
              <line x1="-4" y1="0" x2="4" y2="0" />
              <line x1="0" y1="-4" x2="0" y2="4" />
              <text x="5" y="5" fill="currentColor" fontSize="2.5" fontFamily="monospace" opacity="0.7">PASS_01</text>
            </g>
          </g>
        </svg>
      </div>

      {/* 2. Top Edge System Health Grid */}
      <div className="absolute top-16 left-6 md:left-14 right-6 md:right-14 hidden md:flex items-center justify-between font-mono text-[8px] text-[#00FF41]/45">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
            <span>ENCLAVE_NODE: ACTIVE</span>
          </div>
          <span>|</span>
          <span>INTEGRITY_INDEX: 1.000</span>
          <span>|</span>
          <span>ENTROPY: {entropy}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>SEC_AUDIT: COMPLETE</span>
          <span>|</span>
          <span>TIME: {sysTime}</span>
        </div>
      </div>

      {/* 3. Bottom Edge Tactical Grids & Performance Monitor */}
      <div className="absolute bottom-6 left-6 md:left-14 flex items-center gap-4 font-mono text-[8.5px] text-[#00FF41]/35">
        <div className="hidden lg:flex items-center gap-2">
          <span>[ SCANNING NETWORK INGRESS... ]</span>
          <div className="w-16 h-3 border border-[#00FF41]/15 relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 bg-[#00FF41]/20 animate-[pulse_1.5s_infinite] w-3/4" />
          </div>
        </div>
        <span className="hidden lg:inline text-[#00FF41]/20">|</span>
        <div className="flex items-center gap-3 bg-[#0A0A0A]/65 border border-[#00FF41]/15 px-2 py-1 rounded-[2px] backdrop-blur-xs">
          <div className="flex items-center gap-1">
            <span className="text-[#00E5FF]/70">FPS:</span>
            <span className={`font-bold transition-colors duration-300 ${fps >= 55 ? "text-[#00FF41]" : fps >= 30 ? "text-yellow-400" : "text-red-500"}`}>
              {fps}
            </span>
          </div>
          <span className="text-[#00FF41]/20">/</span>
          <div className="flex items-center gap-1">
            <span className="text-[#00E5FF]/70">LAT:</span>
            <span className="text-white font-bold">{latency}ms</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 md:right-14 hidden md:flex items-center gap-3 font-mono text-[8px] text-[#00FF41]/35">
        <span>SESSION: SECURE_TLS_V1.3</span>
        <span>|</span>
        <span>AUDITOR: K R AARSHANTH</span>
      </div>

      {/* 4. Delicate Corner Target Accents */}
      <div className="absolute top-16 left-6 w-3 h-3 border-t border-l border-[#00FF41]/20" />
      <div className="absolute top-16 right-6 w-3 h-3 border-t border-r border-[#00FF41]/20" />
      <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-[#00FF41]/20" />
      <div className="absolute bottom-6 right-6 w-3 h-3 border-b border-r border-[#00FF41]/20" />
    </div>
  );
}
