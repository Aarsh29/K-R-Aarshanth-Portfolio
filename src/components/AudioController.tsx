import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Sliders, Music, Activity, Radio, Play } from "lucide-react";
import { audioSystem } from "../utils/audioSystem";

export default function AudioController() {
  const [audioSettings, setAudioSettings] = useState(() => audioSystem.getSettings());
  const [isMinimized, setIsMinimized] = useState(true);

  // Subscribe to audio system updates from other controllers (like CommandPalette)
  useEffect(() => {
    const unsubscribe = audioSystem.subscribe(() => {
      setAudioSettings(audioSystem.getSettings());
    });
    return unsubscribe;
  }, []);

  const handleToggleMaster = () => {
    const newMaster = !audioSettings.master;
    audioSystem.setMasterActive(newMaster);
    if (newMaster) {
      audioSystem.playSecurityHandshake();
    } else {
      audioSystem.playClickSound();
    }
  };

  const handleToggleHum = () => {
    if (!audioSettings.master) return;
    audioSystem.setHumActive(!audioSettings.hum);
    audioSystem.playClickSound();
  };

  const handleTogglePings = () => {
    if (!audioSettings.master) return;
    audioSystem.setPingsActive(!audioSettings.pings);
    audioSystem.playClickSound();
  };

  const handleHumVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    audioSystem.setHumVolume(parseFloat(e.target.value));
  };

  const handlePingVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    audioSystem.setPingVolume(parseFloat(e.target.value));
  };

  const triggerHandshake = () => {
    audioSystem.playClickSound();
    // Brief delay to prevent overlap with click
    setTimeout(() => {
      audioSystem.playSecurityHandshake();
    }, 50);
  };

  const triggerClick = () => {
    audioSystem.playClickSound();
  };

  const isAnyLoopPlaying = audioSettings.master && (audioSettings.hum || audioSettings.pings);

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none font-mono">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          // Compact Minimized Controller
          <motion.button
            key="minimized-audio"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => {
              audioSystem.playClickSound();
              setIsMinimized(false);
            }}
            className="flex items-center gap-2 text-[9px] text-[#00FF41]/75 bg-[#050505]/90 border border-[#00FF41]/25 px-3 py-2 rounded-[2px] backdrop-blur-sm shadow-[0_0_12px_rgba(0,255,65,0.08)] hover:bg-[#00FF41]/10 hover:border-[#00FF41]/50 hover:text-[#00FF41] transition-all cursor-pointer pointer-events-auto"
            title="Open Audio Synthesizer Co-Processor"
          >
            {/* Simple audio stream spectrum animation */}
            <div className="flex items-end gap-[2px] h-2 w-3 mr-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`w-[1.5px] bg-[#00FF41] rounded-[0.5px] transition-all duration-300 origin-bottom ${
                    isAnyLoopPlaying ? "animate-[barPulse_0.8s_ease-in-out_infinite]" : "h-[2px]"
                  }`}
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    height: isAnyLoopPlaying ? "100%" : "2px",
                  }}
                />
              ))}
            </div>
            <span className="uppercase tracking-widest font-bold">
              {audioSettings.master ? "AUDIO ACTIVE" : "AUDIO MUTED"}
            </span>
          </motion.button>
        ) : (
          // Expanded Tactical Deck Panel
          <motion.div
            key="expanded-audio"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="w-72 bg-[#080808]/95 border border-[#00FF41]/35 rounded-[3px] shadow-[0_0_30px_rgba(0,255,65,0.12)] backdrop-blur-md overflow-hidden pointer-events-auto"
          >
            {/* Title / Diagnostic Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-black/60 border-b border-[#00FF41]/20">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
                <span className="text-[9px] font-bold tracking-widest text-[#00E5FF] uppercase">
                  CYBER_AUDIO_UNIT v1.4
                </span>
              </div>
              <button
                onClick={() => {
                  audioSystem.playClickSound();
                  setIsMinimized(true);
                }}
                className="text-[8px] text-[#00FF41]/50 hover:text-red-400 border border-[#00FF41]/10 hover:border-red-500/30 px-1 py-0.25 rounded-[1px] transition-colors cursor-pointer"
              >
                [ HIDE ]
              </button>
            </div>

            {/* Simulated Live Scope Graphic */}
            <div className="h-10 bg-black/40 border-b border-[#00FF41]/10 relative flex items-center justify-center overflow-hidden px-4">
              {/* Scope Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />
              <div className="absolute w-full h-[0.5px] bg-[#00FF41]/15 top-1/2 left-0" />
              
              {/* Dynamic Oscilloscope SVG Waveform */}
              <svg className="w-full h-full absolute inset-0 text-[#00FF41]/40" viewBox="0 0 280 40">
                {isAnyLoopPlaying ? (
                  <path
                    d="M 0,20 Q 20,5 40,20 T 80,20 T 120,20 T 160,20 T 200,20 T 240,20 T 280,20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="animate-[waveFlow_4s_linear_infinite]"
                  />
                ) : (
                  <line x1="0" y1="20" x2="280" y2="20" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3,3" className="opacity-40" />
                )}
              </svg>
              <div className="absolute top-1.5 right-2 font-mono text-[6.5px] text-[#00FF41]/40 flex items-center gap-1">
                <span className={`w-1 h-1 rounded-full ${isAnyLoopPlaying ? "bg-[#00FF41] animate-ping" : "bg-neutral-600"}`} />
                <span>{isAnyLoopPlaying ? "RECEIVING SIGNAL" : "SIGNAL STANDBY"}</span>
              </div>
            </div>

            {/* Core Controls */}
            <div className="p-3.5 space-y-3.5">
              {/* Master Mute switch */}
              <div className="flex items-center justify-between border-b border-[#00FF41]/10 pb-2.5">
                <div className="flex items-center gap-2">
                  {audioSettings.master ? (
                    <Volume2 className="w-4 h-4 text-[#00FF41]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-[10px] text-white font-bold tracking-wider uppercase">
                    SYSTEM SOUNDMASTER
                  </span>
                </div>
                <button
                  onClick={handleToggleMaster}
                  className={`text-[8.5px] font-bold tracking-wider px-2 py-0.5 rounded-[1px] border transition-all duration-150 cursor-pointer ${
                    audioSettings.master
                      ? "bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41]"
                      : "bg-red-950/20 border-red-500/50 text-red-400"
                  }`}
                >
                  {audioSettings.master ? "ONLINE" : "MUTED"}
                </button>
              </div>

              {/* Matrix Loops */}
              <div className={`space-y-3 transition-opacity duration-200 ${audioSettings.master ? "opacity-100" : "opacity-35 pointer-events-none"}`}>
                
                {/* 1. Cinematic BGM Loop */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#00FF41]/80 font-bold uppercase tracking-wide">
                      1. Cinematic BGM (Music)
                    </span>
                    <button
                      disabled={!audioSettings.master}
                      onClick={handleToggleHum}
                      className={`text-[8px] font-bold px-1.5 py-0.25 rounded-[1px] border cursor-pointer ${
                        audioSettings.hum && audioSettings.master
                          ? "bg-[#00FF41]/15 border-[#00FF41]/50 text-[#00FF41]"
                          : "border-[#00FF41]/10 text-neutral-500"
                      }`}
                    >
                      {audioSettings.hum ? "ON" : "OFF"}
                    </button>
                  </div>

                  {/* Soundtrack preset switcher buttons */}
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    {(["social_network", "mr_robot", "tron"] as const).map((preset) => {
                      const isActive = audioSettings.bgmPreset === preset;
                      let label = "REZNER";
                      if (preset === "mr_robot") label = "MR. ROBOT";
                      if (preset === "tron") label = "TRON";
                      
                      let activeStyle = "border-[#00FF41] text-[#00FF41] bg-[#00FF41]/10 font-bold";
                      if (preset === "tron") activeStyle = "border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10 font-bold";
                      if (preset === "mr_robot") activeStyle = "border-purple-500 text-purple-400 bg-purple-500/10 font-bold";

                      return (
                        <button
                          key={preset}
                          disabled={!audioSettings.master || !audioSettings.hum}
                          onClick={() => audioSystem.setBgmPreset(preset)}
                          className={`text-[7px] py-1 border rounded-[1px] transition-all cursor-pointer ${
                            isActive
                              ? activeStyle
                              : "border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700"
                          } disabled:opacity-30 disabled:pointer-events-none`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[7.5px] text-neutral-500">VOL:</span>
                    <input
                      type="range"
                      min="0"
                      max="0.3"
                      step="0.01"
                      value={audioSettings.humVolume}
                      disabled={!audioSettings.master || !audioSettings.hum}
                      onChange={handleHumVolumeChange}
                      className="flex-1 accent-[#00FF41] h-1 bg-[#111] rounded cursor-pointer"
                    />
                    <span className="text-[8px] text-[#00E5FF] w-6 text-right">
                      {Math.round(audioSettings.humVolume * 100)}%
                    </span>
                  </div>
                </div>

                {/* 2. Cyber Pings */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#00FF41]/80 font-bold uppercase tracking-wide">
                      2. Data-Stream Pings
                    </span>
                    <button
                      disabled={!audioSettings.master}
                      onClick={handleTogglePings}
                      className={`text-[8px] font-bold px-1.5 py-0.25 rounded-[1px] border cursor-pointer ${
                        audioSettings.pings && audioSettings.master
                          ? "bg-[#00FF41]/15 border-[#00FF41]/50 text-[#00FF41]"
                          : "border-[#00FF41]/10 text-neutral-500"
                      }`}
                    >
                      {audioSettings.pings ? "ON" : "OFF"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[7.5px] text-neutral-500">VOL:</span>
                    <input
                      type="range"
                      min="0"
                      max="0.15"
                      step="0.005"
                      value={audioSettings.pingVolume}
                      disabled={!audioSettings.master || !audioSettings.pings}
                      onChange={handlePingVolumeChange}
                      className="flex-1 accent-[#00FF41] h-1 bg-[#111] rounded cursor-pointer"
                    />
                    <span className="text-[8px] text-[#00E5FF] w-6 text-right">
                      {Math.round(audioSettings.pingVolume * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Soundboard manual triggers */}
              <div className="pt-2 border-t border-[#00FF41]/10 space-y-2">
                <div className="font-mono text-[7.5px] text-neutral-500 uppercase tracking-widest">
                  TACTICAL SIGNAL TRANSMITTERS
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={!audioSettings.master}
                    onClick={triggerHandshake}
                    className="flex items-center justify-center gap-1 text-[8px] font-bold py-1 bg-[#050505] border border-[#00FF41]/20 hover:border-[#00E5FF]/60 hover:text-[#00E5FF] transition-all rounded-[1px] cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    title="Play Pleasant Cybersecurity Handshake Chime"
                  >
                    <Music className="w-2.5 h-2.5" />
                    <span>CHIME</span>
                  </button>
                  <button
                    disabled={!audioSettings.master}
                    onClick={triggerClick}
                    className="flex items-center justify-center gap-1 text-[8px] font-bold py-1 bg-[#050505] border border-[#00FF41]/20 hover:border-[#00FF41]/60 hover:text-[#00FF41] transition-all rounded-[1px] cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                    title="Play Subtle Tactile HUD Click"
                  >
                    <Activity className="w-2.5 h-2.5" />
                    <span>HUD CLICK</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
