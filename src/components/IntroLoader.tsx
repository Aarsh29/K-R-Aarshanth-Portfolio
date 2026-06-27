import React, { useEffect, useState, useRef } from "react";

interface IntroLoaderProps {
  onComplete: () => void;
}

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  const bootLogs = [
    "BOOTING SYSTEM KRA_SEC_PORTFOLIO_V4...",
    "RESOLVING SECURE PORTFOLIO ENVELOPE...",
    "ESTABLISHING AMBIENT 3D THREAT FIELD SWARM...",
    "COMPILE SHADERS: CHROMATIC MATRIX GRID... DONE",
    "DECRYPTING PROFILE STATS & LOG MATRIX... OK",
    "INITIALIZING INTEGRITY CHECK ROUTINES...",
    "SECTOR_01: SECURITY CORE SYSTEM ENGINE... ON",
    "SECTOR_02: PROFILE INTEL LOG DATABASE... SYNCED",
    "SECTOR_03: THREAT OPERATIONS EXPERIENCE... VERIFIED",
    "SECTOR_04: HARDENING MITIGATION PROJECTS... MOUNTED",
    "SECTOR_05: CHRONO TIMELINE HISTORIC RECORDS... LOADED",
    "SSL SHAKEHAND SIMULATION ESTABLISHED (ECDH_P256)...",
    "FIREWALL MODULE: RECON SCANNER ENGINE... ACTIVE",
    "DECRYPTION LEVEL 4 SECURE CLEARANCE ACHIEVED.",
    "SYSTEM LOADED. LAUNCHING CHANNELS..."
  ];

  useEffect(() => {
    let logIdx = 0;
    let progressVal = 0;

    // Incremental log adding
    const addLog = () => {
      if (logIdx < bootLogs.length) {
        setLogs((prev) => [...prev, `> ${bootLogs[logIdx]}`]);
        logIdx++;
        setTimeout(addLog, 100 + Math.random() * 120);
      }
    };

    // Fast but organic progress loader
    const updateProgress = () => {
      if (progressVal < 100) {
        progressVal += Math.floor(Math.random() * 4) + 2;
        if (progressVal > 100) progressVal = 100;
        setProgress(progressVal);
        setTimeout(updateProgress, 30 + Math.random() * 20);
      } else {
        setTimeout(() => {
          setFade(true);
          setTimeout(() => {
            setVisible(false);
            onComplete();
          }, 800);
        }, 500);
      }
    };

    addLog();
    updateProgress();
  }, [onComplete]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 bg-[#050505] z-[99999] flex flex-col justify-center items-center font-mono p-6 transition-opacity duration-800 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="text-sm md:text-base tracking-[4px] text-[#00FF41] mb-6 uppercase font-bold glow-text select-none">
        System Boot // KRA_SEC_PORTFOLIO
      </div>

      {/* Cyber Term Panel */}
      <div
        ref={logsContainerRef}
        className="w-full max-w-lg h-44 md:h-52 bg-[#0A0A0A] border border-[#00FF41]/20 rounded p-4 text-[10px] md:text-xs leading-relaxed text-[#00FF41] overflow-y-auto mb-6 shadow-2xl cyber-scrollbar"
      >
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            <span className={log.includes("OK") || log.includes("DONE") || log.includes("VERIFIED") ? "text-[#00FF41]" : "text-[#00FF41]/80"}>
              {log}
            </span>
          </div>
        ))}
      </div>

      {/* Loader Bar wrapper */}
      <div className="w-full max-w-lg h-[3px] bg-[#00FF41]/10 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00FF41] transition-all duration-75 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percentage Indicators */}
      <div className="text-xs md:text-sm tracking-[2px] text-[#00FF41] font-bold glow-text">
        {String(progress).padStart(2, "0")}%
      </div>
    </div>
  );
}
