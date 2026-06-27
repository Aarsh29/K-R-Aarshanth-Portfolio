import React, { useEffect, useState, useRef } from "react";
import { Terminal, X, RefreshCw, Play, Pause, AlertTriangle, Battery, Zap, History } from "lucide-react";
import { audioSystem } from "../utils/audioSystem";
import { powerSystem, PowerLogEvent } from "../utils/powerSystem";

interface SystemLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogLine {
  text: string;
  type: "ok" | "warn" | "fail" | "info" | "header";
  delay?: number;
}

const BOOT_LOGS_TEMPLATE: LogLine[] = [
  { text: "=== KRA SECURITY SYSTEM BOOT DIAGNOSTICS ===", type: "header" },
  { text: "CORE RUNTIME VERSION: v2.4.9-SECURE", type: "info" },
  { text: "SYSTEM ARCHITECTURE: x86_64 // CYBER_KERNEL_LINUX", type: "info" },
  { text: "TIMESTAMP: " + new Date().toISOString(), type: "info" },
  { text: "--------------------------------------------------", type: "header" },
  { text: "[  OK  ] Initialize low-level physical memory allocation", type: "ok" },
  { text: "[  OK  ] Mounting root filesystem /dev/kra_sec (Read-Only)", type: "ok" },
  { text: "[  OK  ] Loading cryptographic framework library: libcrypto_aes_256_gcm.so", type: "ok" },
  { text: "[ INFO ] Generating local entropy pools... [SUCCESS: 4096 bits]", type: "info" },
  { text: "[  OK  ] Validating kernel hashes: SHA-256 matches master signature", type: "ok" },
  { text: "[  OK  ] Instantiating user privilege protection levels (Ring 0 -> Ring 3)", type: "ok" },
  { text: "[ WARN ] Network device 'kra0' reported unresolved MTU packet fragmentation", type: "warn" },
  { text: "[ INFO ] Auto-configuring static route: 10.0.12.0/24 via kra0", type: "info" },
  { text: "[  OK  ] Firewalled ingress control configured: blocking 997 closed TCP ports", type: "ok" },
  { text: "[  OK  ] Port 22/TCP (SSH) listener bound securely to internal interface", type: "ok" },
  { text: "[  OK  ] Port 443/TCP (HTTPS) bound through secure TLS 1.3 reverse proxy", type: "ok" },
  { text: "[  OK  ] Port 3000/TCP (DEV-SRV) listening for external UI container requests", type: "ok" },
  { text: "[ INFO ] Establishing telemetry connection to core system hub...", type: "info" },
  { text: "[  OK  ] Handshake successful: CORESYSTEM (K R Aarshanth) detected on local node", type: "ok" },
  { text: "[  OK  ] D3 Topology Simulation Engine initialized (438px network bounds)", type: "ok" },
  { text: "[ INFO ] Syncing defensive security metrics...", type: "info" },
  { text: "[  OK  ] Defensive Security node category verified: integrity SECURE", type: "ok" },
  { text: "[ INFO ] Syncing offensive reconnaissance modules...", type: "info" },
  { text: "[ WARN ] Active exploit vectors scanner initialized in sandbox-only mode", type: "warn" },
  { text: "[  OK  ] Web applications hub node categories loaded successfully", type: "ok" },
  { text: "[ ALERT ] Intrusion detection system: Auto-Scan daemon started", type: "warn" },
  { text: "[ INFO ] Securing authorization log database: active-auth monitoring enabled", type: "info" },
  { text: "[  OK  ] Local database cached CVE records: 3 vulnerabilities mapped", type: "ok" },
  { text: "[  OK  ] Core clock synchronized successfully with stratum-1 atomic time", type: "ok" },
  { text: "[ INFO ] Preparing visual HUD graphics pipeline...", type: "info" },
  { text: "[  OK  ] FPS counter daemon started (60 FPS target refresh rate)", type: "ok" },
  { text: "[  OK  ] Latency simulator started with low jitter algorithm (21ms base)", type: "ok" },
  { text: "[  OK  ] Custom cursor coordinate tracker mounted", type: "ok" },
  { text: "--------------------------------------------------", type: "header" },
  { text: "[ SUCCESS ] ALL OPERATIONAL DEFENSIVE SYSTEMS RUNNING GREEN", type: "ok" },
  { text: "STATUS: SECURE. SESSION IS ACTIVE AND SECURED.", type: "header" }
];

export default function SystemLogsModal({ isOpen, onClose }: SystemLogsModalProps) {
  const [activeTab, setActiveTab] = useState<"boot" | "power">("boot");
  const [powerLogs, setPowerLogs] = useState<PowerLogEvent[]>(() => powerSystem.getLogs());
  const [displayedLogs, setDisplayedLogs] = useState<LogLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<number>(40); // ms delay per line
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to power system updates
  useEffect(() => {
    const unsubscribe = powerSystem.subscribe(() => {
      setPowerLogs(powerSystem.getLogs());
    });
    return unsubscribe;
  }, []);

  // Reset and restart boot animation when opening
  useEffect(() => {
    if (isOpen) {
      setDisplayedLogs([]);
      setCurrentLineIndex(0);
      setIsPaused(false);
    }
  }, [isOpen]);

  // Handle typing interval
  useEffect(() => {
    if (!isOpen || isPaused) return;
    if (currentLineIndex >= BOOT_LOGS_TEMPLATE.length) return;

    const timer = setTimeout(() => {
      setDisplayedLogs((prev) => [...prev, BOOT_LOGS_TEMPLATE[currentLineIndex]]);
      const nextIndex = currentLineIndex + 1;
      setCurrentLineIndex(nextIndex);
      
      // If we just loaded the very last line of the diagnostics log template
      if (nextIndex === BOOT_LOGS_TEMPLATE.length) {
        audioSystem.playSecurityHandshake();
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isOpen, currentLineIndex, isPaused, speed]);

  // Autoscroll to bottom as new logs stream in
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedLogs]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        audioSystem.playClickSound();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReboot = () => {
    audioSystem.playClickSound();
    setDisplayedLogs([]);
    setCurrentLineIndex(0);
    setIsPaused(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300">
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl border border-[#00FF41]/30 bg-black rounded-[3px] shadow-[0_0_25px_rgba(0,255,65,0.15)] flex flex-col h-[500px] cyber-panel select-none">
        
        {/* Top Title Bar */}
        <div className="flex items-center justify-between border-b border-[#00FF41]/25 px-4 py-2.5 bg-[#050505] font-mono text-xs text-[#00FF41]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00E5FF] animate-pulse" />
            <span className="font-bold tracking-wider uppercase text-[#00E5FF]">KRA_SECURITY_CORE // SYSTEM_CONSOLE</span>
          </div>
          <button 
            onClick={() => {
              audioSystem.playClickSound();
              onClose();
            }}
            className="flex items-center gap-1 text-[9px] uppercase border border-[#00FF41]/35 px-1.5 py-0.5 rounded-[1px] hover:bg-red-950/30 hover:border-red-500 hover:text-red-400 transition-all duration-150 cursor-pointer"
          >
            <span>[ ESC ]</span>
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Tab Switcher Sub-Header */}
        <div className="flex border-b border-[#00FF41]/20 bg-[#020202] font-mono text-[9px] sm:text-[10px]">
          <button
            onClick={() => {
              audioSystem.playClickSound();
              setActiveTab("boot");
            }}
            className={`flex-1 py-2 flex items-center justify-center gap-2 border-r border-[#00FF41]/15 transition-all cursor-pointer ${
              activeTab === "boot"
                ? "text-[#00FF41] bg-[#00FF41]/10 font-bold border-b-2 border-b-[#00FF41]"
                : "text-neutral-500 hover:text-white hover:bg-neutral-900/40"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>[ BOOT_DIAGNOSTICS_LOGS ]</span>
          </button>
          <button
            onClick={() => {
              audioSystem.playClickSound();
              setActiveTab("power");
            }}
            className={`flex-1 py-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "power"
                ? "text-[#00E5FF] bg-[#00E5FF]/10 font-bold border-b-2 border-b-[#00E5FF]"
                : "text-neutral-500 hover:text-white hover:bg-neutral-900/40"
            }`}
          >
            <Battery className="w-3.5 h-3.5" />
            <span>[ SYSTEM_POWER_LOGS ]</span>
          </button>
        </div>

        {/* Tactical Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#00FF41]/15 px-4 py-2 bg-[#080808] font-mono text-[9px] text-[#00FF41]/70">
          {activeTab === "boot" ? (
            <>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    audioSystem.playClickSound();
                    setIsPaused(!isPaused);
                  }}
                  className="flex items-center gap-1 border border-[#00FF41]/25 px-2 py-0.5 rounded-[1px] hover:bg-[#00FF41]/10 hover:text-[#00FF41] transition-all cursor-pointer"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-2.5 h-2.5 text-[#00FF41]" />
                      <span>RESUME_STREAM</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-2.5 h-2.5 text-yellow-400" />
                      <span>PAUSE_STREAM</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReboot}
                  className="flex items-center gap-1 border border-[#00FF41]/25 px-2 py-0.5 rounded-[1px] hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] hover:border-[#00E5FF]/50 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5 text-[#00E5FF]" />
                  <span>REBOOT_SIM</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>SPEED:</span>
                <button
                  onClick={() => {
                    audioSystem.playClickSound();
                    setSpeed(80);
                  }}
                  className={`px-1.5 py-0.5 border ${speed === 80 ? "bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41]" : "border-[#00FF41]/20 hover:border-[#00FF41]/40"} cursor-pointer`}
                >
                  SLOW
                </button>
                <button
                  onClick={() => {
                    audioSystem.playClickSound();
                    setSpeed(40);
                  }}
                  className={`px-1.5 py-0.5 border ${speed === 40 ? "bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41]" : "border-[#00FF41]/20 hover:border-[#00FF41]/40"} cursor-pointer`}
                >
                  NORMAL
                </button>
                <button
                  onClick={() => {
                    audioSystem.playClickSound();
                    setSpeed(10);
                  }}
                  className={`px-1.5 py-0.5 border ${speed === 10 ? "bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41]" : "border-[#00FF41]/20 hover:border-[#00FF41]/40"} cursor-pointer`}
                >
                  FAST
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <span className="text-[#00E5FF] font-bold">POWER_LOGS_ENGINE: ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    audioSystem.playClickSound();
                    const randomSubsystems: ("KERNEL" | "UI_ENGINE" | "GRAPH_SIM" | "AUDIO_COPROC" | "CIPHER_CORE")[] = ["KERNEL", "UI_ENGINE", "GRAPH_SIM", "AUDIO_COPROC", "CIPHER_CORE"];
                    const randomSubsystem = randomSubsystems[Math.floor(Math.random() * randomSubsystems.length)];
                    const descriptions = [
                      "Manual diagnostic scan request triggered by active session operator",
                      "Full database decryption sweep on encrypted local storage blocks",
                      "Re-orienting network topology coordinates map visualization parameters",
                      "Tactical soundboard signal handshake re-validation audit",
                      "Telemetry ping response dispatch to stratum security core"
                    ];
                    const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
                    const logs = powerSystem.getLogs();
                    const lastLevel = logs.length > 0 ? logs[0].currentLevel : 100;
                    const nextLevel = Math.max(5, lastLevel - Math.floor(Math.random() * 3) - 1);
                    powerSystem.addLog(lastLevel, nextLevel, randomDesc, randomSubsystem);
                  }}
                  className="flex items-center gap-1 border border-[#00E5FF]/25 px-2 py-0.5 rounded-[1px] text-[#00E5FF] hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/60 hover:text-[#00E5FF] transition-all cursor-pointer text-[8px]"
                >
                  <Zap className="w-2.5 h-2.5 text-yellow-400" />
                  <span>SIMULATE_DRAIN_EVENT</span>
                </button>
                <button
                  onClick={() => {
                    audioSystem.playClickSound();
                    localStorage.removeItem("kra_power_logs");
                    powerSystem.addLog(100, 100, "", "KERNEL");
                  }}
                  className="flex items-center gap-1 border border-red-500/25 px-2 py-0.5 rounded-[1px] text-red-400 hover:bg-red-500/10 hover:border-red-500/60 hover:text-red-300 transition-all cursor-pointer text-[8px]"
                >
                  <span>CLEAR_POWER_LOGS</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Terminal Content Box */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1.5 bg-[#020202] text-white/90 cyber-scrollbar relative select-text selection:bg-[#00FF41]/20">
          
          {/* Subtle Scan Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00FF41]/5 pointer-events-none animate-[scan_8s_linear_infinite]" />
          
          {/* Subtle terminal scan grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.008)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

          {activeTab === "boot" ? (
            <>
              {displayedLogs.map((log, index) => {
                let typeColor = "text-[#00FF41]";
                if (log.type === "warn") typeColor = "text-yellow-400";
                if (log.type === "fail") typeColor = "text-red-500 font-bold";
                if (log.type === "info") typeColor = "text-[#00E5FF]";
                if (log.type === "header") typeColor = "text-white font-bold tracking-wider";

                return (
                  <div 
                    key={index} 
                    className={`leading-relaxed break-all ${typeColor} animate-[fadeIn_0.15s_ease-out]`}
                  >
                    {log.text}
                  </div>
                );
              })}

              {currentLineIndex < BOOT_LOGS_TEMPLATE.length && !isPaused && (
                <div className="flex items-center gap-1.5 text-[#00FF41] font-bold text-[10px] mt-2">
                  <span className="w-1.5 h-3 bg-[#00FF41] animate-pulse" />
                  <span className="text-[9px] tracking-wider uppercase text-[#00FF41]/50">STREAMING DECRYPTED DATA...</span>
                </div>
              )}
            </>
          ) : (
            // POWER LOGS VIEW
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out] text-neutral-300">
              {/* Dynamic Power Metrics Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-[#00E5FF]/20 bg-[#00E5FF]/5 p-3 rounded-[2px]">
                <div className="space-y-0.5">
                  <div className="text-[7.5px] text-neutral-500 uppercase tracking-widest">POWER_SOURCE</div>
                  <div className="text-[10px] text-white font-bold">BATTERY_INTERNAL</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[7.5px] text-neutral-500 uppercase tracking-widest">CURRENT_CELLS</div>
                  <div className="text-[10px] text-[#00E5FF] font-bold">Li-Po SECURE 4.2V</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[7.5px] text-neutral-500 uppercase tracking-widest">DRAIN_EVENTS</div>
                  <div className="text-[10px] text-yellow-500 font-bold">{powerLogs.filter(e => e.reason).length} LOGGED</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[7.5px] text-neutral-500 uppercase tracking-widest">THERMAL_STATE</div>
                  <div className="text-[10px] text-[#00FF41] font-bold">30.8°C NOMINAL</div>
                </div>
              </div>

              {/* Title Section */}
              <div className="flex items-center justify-between border-b border-[#00E5FF]/20 pb-2">
                <div className="flex items-center gap-1.5 text-[#00E5FF] font-bold uppercase tracking-wider text-[10px]">
                  <History className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>BATTERY DRAINAGE LOG DECK</span>
                </div>
                <span className="text-[8px] text-neutral-500 uppercase">REAL-TIME MONITOR</span>
              </div>

              {/* Power Log Entries list */}
              {powerLogs.filter(e => e.reason).length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-[10px] italic">
                  NO POWER DRAINAGE EVENTS RECORDED. SYSTEM IS FULLY SATURATED.
                </div>
              ) : (
                <div className="space-y-2.5 text-left">
                  {powerLogs.filter(e => e.reason).map((evt) => {
                    let subColor = "text-white border-neutral-700 bg-neutral-900/50";
                    if (evt.subsystem === "KERNEL") subColor = "text-[#00FF41] border-[#00FF41]/30 bg-[#00FF41]/5";
                    if (evt.subsystem === "UI_ENGINE") subColor = "text-yellow-400 border-yellow-500/30 bg-yellow-500/5";
                    if (evt.subsystem === "GRAPH_SIM") subColor = "text-[#00E5FF] border-[#00E5FF]/30 bg-[#00E5FF]/5";
                    if (evt.subsystem === "AUDIO_COPROC") subColor = "text-pink-500 border-pink-500/30 bg-pink-500/5";
                    if (evt.subsystem === "CIPHER_CORE") subColor = "text-purple-400 border-purple-500/30 bg-purple-500/5";

                    return (
                      <div 
                        key={evt.id} 
                        className="p-2.5 border border-neutral-900 bg-black/60 hover:bg-[#020202] hover:border-neutral-800 transition-all duration-150 rounded-[2px] space-y-1.5 text-[9.5px]"
                      >
                        <div className="flex items-center justify-between text-[8px] tracking-wider text-neutral-500">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-400">{evt.id}</span>
                            <span>•</span>
                            <span>{new Date(evt.timestamp).toLocaleString()}</span>
                          </div>
                          <span className={`px-1.5 py-0.25 border rounded-[1px] font-bold text-[7.5px] uppercase ${subColor}`}>
                            {evt.subsystem}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-white font-medium">{evt.reason}</div>
                          <div className="shrink-0 flex items-center gap-1 text-red-400 font-bold font-mono">
                            <Zap className="w-3 h-3 text-red-500 animate-pulse" />
                            <span>-{evt.drainPercent}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[7.5px] text-neutral-500">
                          <span>VOLTAGE GAP:</span>
                          <span className="text-neutral-400">{evt.previousLevel}%</span>
                          <span className="text-neutral-600">→</span>
                          <span className="text-[#00FF41]">{evt.currentLevel}%</span>
                          <span className="ml-auto text-neutral-500">STATUS: VERIFIED</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>

        {/* Bottom Status Panel */}
        <div className="flex items-center justify-between border-t border-[#00FF41]/25 px-4 py-2 bg-[#050505] font-mono text-[8px] text-[#00FF41]/55 uppercase tracking-widest">
          {activeTab === "boot" ? (
            <>
              <div>
                TOTAL RECORDS: {BOOT_LOGS_TEMPLATE.length} / STREAMED: {displayedLogs.length}
              </div>
              <div>
                {currentLineIndex >= BOOT_LOGS_TEMPLATE.length ? (
                  <span className="text-[#00FF41] font-bold animate-pulse">● DIAGNOSTICS COMPLETE</span>
                ) : isPaused ? (
                  <span className="text-yellow-400">● STREAM PAUSED</span>
                ) : (
                  <span className="text-[#00E5FF] animate-pulse">● SEC_BOOT_IN_PROGRESS</span>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                TOTAL POWER LOGS: {powerLogs.filter(e => e.reason).length} ACTIVE
              </div>
              <div>
                <span className="text-[#00E5FF] font-bold animate-pulse">● POWER CELLS STABLE</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Internal Custom Animations */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
