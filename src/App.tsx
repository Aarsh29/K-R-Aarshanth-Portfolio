import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { Mail, Github, Linkedin, Phone, ArrowRight, ShieldAlert, Cpu, Database, Activity, Lock, ExternalLink, Battery, BatteryMedium, BatteryLow } from "lucide-react";
import { experiences, skillCategories, projects, timelineItems } from "./data";
import IntroLoader from "./components/IntroLoader";
import CyberCanvas from "./components/CyberCanvas";
import CyberSidebar from "./components/CyberSidebar";
import SecureAvatar from "./components/SecureAvatar";
import ScrambleText from "./components/ScrambleText";
import TerminalSandbox from "./components/TerminalSandbox";
import CyberCursor from "./components/CyberCursor";
import CyberHUD from "./components/CyberHUD";
import CommandPalette from "./components/CommandPalette";
import NetworkGraph from "./components/NetworkGraph";
import CyberDecoder from "./components/CyberDecoder";
import SystemLogsModal from "./components/SystemLogsModal";
import AudioController from "./components/AudioController";
import { powerSystem } from "./utils/powerSystem";

// Ranges for active slides matching scroll metrics
const RANGES = [
  [-0.05, 0.083], // Slide 0: Home (centered at 0.0)
  [0.083, 0.25],  // Slide 1: About me (centered at 0.167)
  [0.25, 0.417],  // Slide 2: Experience (centered at 0.333)
  [0.417, 0.583], // Slide 3: Skills (centered at 0.5)
  [0.583, 0.75],  // Slide 4: Operations (centered at 0.667)
  [0.75, 0.917],  // Slide 5: Timeline (centered at 0.833)
  [0.917, 1.05]   // Slide 6: Get in Touch (centered at 1.0)
];

const NAV_TARGETS = [0, 0.1667, 0.3333, 0.5, 0.6667, 0.8333, 1.0];
const NAV_LABELS = ["Home", "Intel", "Focus", "Tools", "Ops", "Timeline", "Secure Link"];

// Typewriter effect state
const ROLES = [
  "Cybersecurity Intern (Red Teaming)",
  "Red Team Operator",
  "Vulnerability Exploit Researcher",
  "Adversarial Simulator",
  "Security Automation Builder"
];

export default function App() {
  const [isBooted, setIsBooted] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [operationsMode, setOperationsMode] = useState<"grid" | "topology">("grid");
  const [theme, setTheme] = useState("green");
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isScrollInitialized, setIsScrollInitialized] = useState(false);

  const handleThemeChange = (themeColor: string) => {
    setTheme(themeColor);
    const root = document.documentElement;
    if (themeColor === "cyan") {
      root.style.setProperty("--cyber-primary", "#00E5FF");
      root.style.setProperty("--cyber-primary-rgb", "0, 229, 255");
      root.style.setProperty("--cyber-secondary", "#00FF41");
      root.style.setProperty("--cyber-accent", "#BD00FF");
      root.style.setProperty("--cyber-muted", "rgba(0, 229, 255, 0.5)");
      root.style.setProperty("--cyber-border", "rgba(0, 229, 255, 0.2)");
      root.style.setProperty("--cyber-dark-border", "#0A2B3A");
    } else if (themeColor === "red") {
      root.style.setProperty("--cyber-primary", "#FF3B30");
      root.style.setProperty("--cyber-primary-rgb", "255, 59, 48");
      root.style.setProperty("--cyber-secondary", "#FFCC00");
      root.style.setProperty("--cyber-accent", "#FF3B30");
      root.style.setProperty("--cyber-muted", "rgba(255, 59, 48, 0.5)");
      root.style.setProperty("--cyber-border", "rgba(255, 59, 48, 0.2)");
      root.style.setProperty("--cyber-dark-border", "#3A0A0A");
    } else if (themeColor === "gold") {
      root.style.setProperty("--cyber-primary", "#FFD700");
      root.style.setProperty("--cyber-primary-rgb", "255, 215, 0");
      root.style.setProperty("--cyber-secondary", "#00FF41");
      root.style.setProperty("--cyber-accent", "#FF007F");
      root.style.setProperty("--cyber-muted", "rgba(255, 215, 0, 0.5)");
      root.style.setProperty("--cyber-border", "rgba(255, 215, 0, 0.2)");
      root.style.setProperty("--cyber-dark-border", "#3A300A");
    }
  };

  const [battery, setBattery] = useState(100);
  const currentSlideRef = useRef(0);

  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  // Decrement battery gradually over time
  useEffect(() => {
    if (!isBooted) return;
    const timer = setInterval(() => {
      setBattery((b) => Math.max(5, b - 1));
    }, 15000);
    return () => clearInterval(timer);
  }, [isBooted]);

  // Also decrement when navigating slides
  useEffect(() => {
    if (isBooted) {
      setBattery((b) => Math.max(5, b - 1));
    }
  }, [currentSlide, isBooted]);

  const prevBatteryRef = useRef(100);
  const lastLoggedSlideRef = useRef(0);

  // Monitor battery level for power drain events
  useEffect(() => {
    if (battery < prevBatteryRef.current) {
      const reasons: { desc: string; sub: "KERNEL" | "UI_ENGINE" | "GRAPH_SIM" | "AUDIO_COPROC" | "CIPHER_CORE" }[] = [
        { desc: "Idle telemetry reporting to central security hub", sub: "KERNEL" },
        { desc: "Slide transition and interactive visual render overhead", sub: "UI_ENGINE" },
        { desc: "Soundboard coprocessor audio handshake transmission", sub: "AUDIO_COPROC" },
        { desc: "Cryptographic validation of local storage security vaults", sub: "CIPHER_CORE" },
        { desc: "Active D3 threat topology simulation refresh cycles", sub: "GRAPH_SIM" }
      ];
      
      const isSlideNav = currentSlideRef.current !== lastLoggedSlideRef.current;
      const reasonObj = isSlideNav 
        ? { desc: `Rapid UI slide navigation (Slide ${currentSlideRef.current + 1} activation)`, sub: "UI_ENGINE" as const }
        : reasons[Math.floor(Math.random() * reasons.length)];
        
      if (isSlideNav) {
        lastLoggedSlideRef.current = currentSlideRef.current;
      }

      powerSystem.addLog(prevBatteryRef.current, battery, reasonObj.desc, reasonObj.sub);
    }
    prevBatteryRef.current = battery;
  }, [battery]);

  const lastLoopTimeRef = useRef(0);
  const mainScrollRef = useRef<HTMLDivElement | null>(null);

  const [roleText, setRoleText] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Stable callback to handle boot completion
  const handleBootComplete = useCallback(() => {
    setIsBooted(true);
  }, []);

  // Initialize scroll tracking, endless wheel/touch loops, and restore position
  useEffect(() => {
    if (!isBooted) {
      document.body.style.minHeight = "100vh";
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    // Standard manual scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const el = mainScrollRef.current;
    if (!el) return;

    let lastScrollTop = el.scrollTop;
    let snapTimeout: ReturnType<typeof setTimeout> | null = null;

    const scheduleSnap = (scrollTop: number, slideHeight: number) => {
      if (snapTimeout) clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        const nearestIndex = Math.round(el.scrollTop / slideHeight);
        const boundedIndex = Math.max(0, Math.min(8, nearestIndex));
        const targetScroll = boundedIndex * slideHeight;
        if (Math.abs(el.scrollTop - targetScroll) > 2) {
          el.scrollTop = targetScroll;
        }
      }, 120);
    };

    const handleScroll = () => {
      const currentScroll = el.scrollTop;
      const slideHeight = el.clientHeight || window.innerHeight;
      if (slideHeight <= 0) return;

      const delta = currentScroll - lastScrollTop;
      
      // Single velocity threshold (sudden jump in scroll position) to distinguish programmatic warps
      const VELOCITY_THRESHOLD = slideHeight * 0.5;
      const isWarp = Math.abs(delta) > VELOCITY_THRESHOLD;

      if (isWarp) {
        // High-velocity programmatic jump completed; sync baseline and skip to prevent stuttering loops
        lastScrollTop = currentScroll;
        return;
      }

      lastScrollTop = currentScroll;

      const rawIndex = Math.round(currentScroll / slideHeight);

      // Determine progress bar scroll ratio
      const progress = (currentScroll - slideHeight) / (6 * slideHeight);
      setScrollRatio(Math.max(0, Math.min(1, progress)));

      // Map rawIndex to active slide (0 to 6)
      let activeSlide = 0;
      // Guard against uninitialized layouts where scrollHeight hasn't finished establishing
      if (el.scrollHeight > slideHeight * 2) {
        if (rawIndex === 0) {
          activeSlide = 6;
        } else if (rawIndex === 8) {
          activeSlide = 0;
        } else {
          activeSlide = rawIndex - 1;
        }
      } else {
        activeSlide = 0;
      }
      setCurrentSlide(activeSlide);

      // Warp logic for seamless infinite scroll
      // A generous threshold of 10px is now completely safe since isWarp filters feedback events
      if (currentScroll <= 10 && el.scrollHeight > slideHeight * 2) {
        el.scrollTop = 7 * slideHeight;
      } else if (currentScroll >= 8 * slideHeight - 10 && el.scrollHeight > slideHeight * 2) {
        el.scrollTop = 1 * slideHeight;
      } else {
        scheduleSnap(currentScroll, slideHeight);
      }
    };

    // Set initial scroll to real Slide 0 (index 1) with robust deferred retries
    const setInitialScroll = () => {
      const slideHeight = el.clientHeight || window.innerHeight;
      if (slideHeight > 0 && el.scrollHeight > slideHeight * 2) {
        // Temporarily disable smooth scroll to force instant jump while preserving snap.
        const prevBehavior = el.style.scrollBehavior;
        
        el.style.scrollBehavior = "auto";
        el.style.scrollSnapType = "y mandatory";
        el.scrollTop = slideHeight;
        lastScrollTop = el.scrollTop;
        
        // Force style/layout flush to ensure the browser applies the jump instantly
        const _ = el.scrollTop;
        
        handleScroll();
        setIsScrollInitialized(true);
        
        // Restore smooth scrolling; snap remains enabled through CSS and inline style.
        requestAnimationFrame(() => {
          el.style.scrollBehavior = prevBehavior || "smooth";
        });
      }
    };

    // Observe changes to the layout or size to initialize scroll safely
    const resizeObserver = new ResizeObserver(() => {
      setInitialScroll();
    });
    resizeObserver.observe(el);

    // Trigger immediately
    setInitialScroll();

    // Trigger after layout/paint cycles
    let raf1 = requestAnimationFrame(() => {
      let raf2 = requestAnimationFrame(() => {
        setInitialScroll();
      });
    });

    const timeoutId = setTimeout(setInitialScroll, 50);
    const timeoutId2 = setTimeout(setInitialScroll, 150);
    const timeoutId3 = setTimeout(setInitialScroll, 300);

    const handleResize = () => {
      const slideHeight = el.clientHeight || window.innerHeight;
      el.scrollTop = (currentSlideRef.current + 1) * slideHeight;
    };

    el.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(raf1);
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [isBooted]);

  // Handle keyboard navigation (ArrowDown / ArrowUp)
  useEffect(() => {
    if (!isBooted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing inside an input, textarea, terminal or has contenteditable active
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
         activeEl.tagName === "TEXTAREA" ||
         activeEl.hasAttribute("contenteditable") ||
         activeEl.closest(".terminal-input-container") ||
         activeEl.closest("form") ||
         activeEl.id === "terminal-input")
      ) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextSlide = (currentSlide + 1) % NAV_TARGETS.length;
        handleNavClick(nextSlide);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevSlide = (currentSlide - 1 + NAV_TARGETS.length) % NAV_TARGETS.length;
        handleNavClick(prevSlide);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBooted, currentSlide]);

  // Typewriter timing loop
  useEffect(() => {
    if (!isBooted) return;

    let timer: NodeJS.Timeout;
    const currentRole = ROLES[roleIndex];

    if (isTyping) {
      if (charIndex < currentRole.length) {
        timer = setTimeout(() => {
          setRoleText((prev) => prev + currentRole[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 75);
      } else {
        timer = setTimeout(() => {
          setIsTyping(false);
        }, 1800);
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setRoleText((prev) => prev.slice(0, -1));
          setCharIndex((prev) => prev - 1);
        }, 40);
      } else {
        setIsTyping(true);
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [isBooted, charIndex, isTyping, roleIndex]);

  const handleNavClick = (idx: number) => {
    if (!mainScrollRef.current) return;
    const el = mainScrollRef.current;
    const slideEl = el.children[idx + 1] as HTMLElement;
    if (slideEl) {
      slideEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isSlideActive = (idx: number) => {
    return currentSlide === idx;
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#00FF41] font-mono scanline-hud select-none overflow-hidden">
      {/* Immersive Outer Console Frame */}
      <div className="console-frame" />

      {/* Interactive Cursor overlay */}
      <CyberCursor />

      {/* Intro Boot Loader Screen */}
      {!isBooted && <IntroLoader onComplete={handleBootComplete} />}

      {/* WebGL Canvas Backdrop */}
      {isBooted && <CyberCanvas currentSlide={currentSlide} />}
      {isBooted && <CyberHUD />}

      {/* HUD Coordinates and Metrics */}
      {isBooted && (
        <>
          {/* Static Layout Helper Lines */}
          <div className="fixed inset-0 z-2 pointer-events-none flex justify-between select-none opacity-10">
            <span className="w-[1px] h-full bg-[#00FF41]/10" />
            <span className="w-[1px] h-full bg-[#00FF41]/10" />
            <span className="w-[1px] h-full bg-[#00FF41]/10" />
            <span className="w-[1px] h-full bg-[#00FF41]/10" />
          </div>

          {/* Progress bar line */}
          <div
            className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-[#00E5FF] to-[#00FF41] z-50 transition-all duration-100 ease-out"
            style={{ width: `${scrollRatio * 100}%` }}
          />

          {/* HEADER NAV */}
          <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-[#00FF41]/10 flex items-center justify-between px-6 md:px-14 py-4 select-none">
            <div className="flex flex-col gap-0.5">
              <div className="font-mono text-sm tracking-[3px] text-[#00FF41] glow-text uppercase">
                K R Aarshanth
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[8.5px] font-mono text-[#00FF41]/40 uppercase tracking-widest mt-0.5">
                <span>LOC: 13.0827° N / 80.2707° E</span>
                <span className="opacity-30">|</span>
                <span>SYS_CORE: WEBGL2_ICE</span>
                <span className="opacity-30">|</span>
                <span>SWARM: 600</span>
              </div>
            </div>
            
            <nav className="hidden lg:flex gap-7">
              {NAV_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavClick(idx)}
                  className={`font-mono text-[11px] tracking-widest uppercase transition-colors duration-300 relative py-1 ${
                    currentSlide === idx
                      ? "text-[#00FF41] glow-text"
                      : "text-[#00FF41]/40 hover:text-[#00FF41]"
                  }`}
                >
                  {label}
                  {currentSlide === idx && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#00FF41] animate-pulse" />
                  )}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Mock Battery Status Indicator */}
              <div className="flex items-center gap-2 font-mono text-[9px] md:text-[10px] text-[#00FF41]/80 bg-[#00FF41]/5 border border-[#00FF41]/15 px-2.5 py-1.5 rounded-[2px] backdrop-blur-md select-none shrink-0">
                {battery > 60 ? (
                  <Battery className="w-3.5 h-3.5 text-[#00FF41]" />
                ) : battery > 20 ? (
                  <BatteryMedium className="w-3.5 h-3.5 text-yellow-500" />
                ) : (
                  <BatteryLow className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                )}
                <span className={`tracking-widest ${battery <= 20 ? "text-red-500 font-bold animate-pulse" : ""}`}>
                  SYS_PWR: {battery}%
                </span>
              </div>

              <a
                href="mailto:aarshanth5119@gmail.com"
                className="font-mono text-[10px] tracking-wider uppercase text-[#050505] bg-[#00FF41] px-5 py-2.5 rounded-[2px] font-semibold hover:bg-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,65,0.6)]"
              >
                Secure Tunnel
              </a>
            </div>
          </header>

          {/* SLIDES WRAPPER */}
          <main
            ref={mainScrollRef}
            className={`relative z-10 w-full h-screen overflow-y-auto flex flex-col scrollbar-none ${
              isScrollInitialized ? "snap-y snap-mandatory scroll-smooth" : ""
            }`}
          >
            {/* Slide 6 (Clone) */}
            <div
              className="h-screen w-full snap-start snap-always flex-shrink-0 relative flex flex-col justify-center items-center px-4 md:px-14 pt-20 pb-8 lg:pt-24 lg:pb-12"
            >
              <div className={`cyber-panel max-w-5xl w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-160px)] overflow-y-auto cyber-scrollbar transition-all duration-600 ${
                isSlideActive(6)
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}>
                <div className="flex-1 flex flex-col justify-center relative">
                  {/* Subtle pulsing background glow */}
                  <div className="absolute -left-12 -top-10 w-80 h-48 rounded-full bg-radial from-[#00FF41]/5 to-transparent animate-pulse pointer-events-none" />

                  <div className="relative z-10">
                    <div className="font-mono text-[10px] tracking-[3.5px] text-[#00E5FF] uppercase mb-3">
                      Secure Channel
                    </div>
                    <h2 className="font-bold text-4xl md:text-5xl uppercase leading-none mb-4">
                      <ScrambleText text="Get in Touch" trigger={isSlideActive(6)} />
                    </h2>
                    <p className="text-xs md:text-sm text-[#00FF41]/85 max-w-lg leading-relaxed mb-6">
                      Cybersecurity researcher and systems builder open to internship, freelance, and security auditor opportunities. Reach out for secure collaborations.
                    </p>

                    <div className="flex flex-col gap-4">
                      <a
                        href="mailto:aarshanth5119@gmail.com"
                        className="inline-flex items-center gap-3 bg-[#00FF41]/4 border border-[#00FF41]/25 hover:border-[#00FF41] text-white px-5 py-3 rounded-[2px] transition-all duration-300 max-w-max hover:shadow-[0_0_12px_rgba(0,255,65,0.4)] font-mono text-xs md:text-sm"
                      >
                        <Mail className="w-4 h-4 text-[#00FF41]" />
                        <span>aarshanth5119@gmail.com</span>
                      </a>

                      <div className="inline-flex items-center gap-2 border border-[#00FF41]/20 bg-[#00FF41]/4 px-3 py-1.5 rounded-[2px] w-max">
                        <span className="w-1.5 h-1.5 bg-[#00FF41] rounded-full animate-ping" />
                        <span className="font-mono text-[9px] text-[#00FF41] tracking-wider uppercase font-semibold">
                          Active System Auditor
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-8 font-mono text-[10px] md:text-xs">
                      <a
                        href="https://github.com/Aarsh29"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00FF41]/50 hover:text-[#00FF41] transition-colors py-1"
                      >
                        GitHub
                      </a>
                      <span className="h-3.5 w-[1px] bg-[#00FF41]/15" />
                      <a
                        href="https://www.linkedin.com/in/aarsh2906/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00FF41]/50 hover:text-[#00FF41] transition-colors py-1"
                      >
                        LinkedIn
                      </a>
                      <span className="h-3.5 w-[1px] bg-[#00FF41]/15" />
                      <a
                        href="tel:+917550028237"
                        className="text-[#00FF41]/50 hover:text-[#00FF41] transition-colors py-1"
                      >
                        +91 75500 28237
                      </a>
                    </div>
                  </div>
                </div>

                <CyberSidebar slideIndex={6} />
              </div>
            </div>

            {/* Slide 0: Home */}
            <div
              className="h-screen w-full snap-start snap-always flex-shrink-0 relative flex flex-col justify-center items-center px-4 md:px-14 pt-20 pb-8 lg:pt-24 lg:pb-12"
            >
              <div className={`max-w-4xl w-full flex flex-col items-center justify-center text-center transition-all duration-600 ${
                isSlideActive(0)
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}>
                <div className="font-mono text-[9px] md:text-[10px] tracking-[1.5px] md:tracking-[3px] text-red-500 uppercase mb-5 flex flex-wrap items-center justify-center gap-1.5 md:gap-2 font-bold animate-pulse text-center leading-relaxed max-w-xs sm:max-w-md md:max-w-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                  <span>Cybersecurity Intern (Red Teaming) @ Cyart Tech LLP  ·  Remote (Gujarat, India)</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
                  <div className="flex-shrink-0 relative">
                    <SecureAvatar />
                  </div>
                  <div className="text-center md:text-left max-w-lg flex flex-col items-center md:items-start">
                    <h1 className="font-bold text-4xl md:text-6xl tracking-tight leading-[0.95] text-white uppercase mb-4">
                       <ScrambleText text="K R Aarshanth" trigger={isSlideActive(0)} />
                    </h1>
                    <div className="font-mono text-xs md:text-sm text-[#00FF41]/90 flex items-center justify-center md:justify-start min-h-[24px]">
                      <span>I am a&nbsp;</span>
                      <span className="text-[#00FF41] glow-text font-bold">{roleText}</span>
                      <span className="w-[2px] h-3.5 bg-[#00FF41] ml-0.5 blink" />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
                      <span className="text-[10px] font-mono tracking-wider text-red-500 border border-red-500/40 bg-red-950/10 px-3 py-1 rounded-[2px] font-bold shadow-[0_0_8px_rgba(239,68,68,0.15)]">
                        RED TEAMING
                      </span>
                      <span className="text-[10px] font-mono tracking-wider text-[#00FF41] border border-[#00FF41]/35 bg-[#050505]/80 px-3 py-1 rounded-[2px]">
                        Adversarial Emulation
                      </span>
                      <span className="text-[10px] font-mono tracking-wider text-[#00E5FF] border border-[#00E5FF]/35 bg-[#050505]/80 px-3 py-1 rounded-[2px]">
                        B.Tech CSE (Cyber Security)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 1: About me */}
            <div
              className="h-screen w-full snap-start snap-always flex-shrink-0 relative flex flex-col justify-center items-center px-4 md:px-14 pt-20 pb-8 lg:pt-24 lg:pb-12"
            >
              <div className={`cyber-panel mx-auto max-w-5xl w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-160px)] overflow-y-auto cyber-scrollbar transition-all duration-600 ${
                isSlideActive(1)
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[10px] tracking-[3.5px] text-[#00E5FF] uppercase mb-3">
                    Profile Intel
                  </div>
                  <h2 className="font-bold text-4xl md:text-5xl uppercase leading-none mb-6">
                    <ScrambleText text="About me" trigger={isSlideActive(1)} />
                  </h2>

                  {/* Detailed narrative intro */}
                  <div className="mb-6 p-4 border border-[#00FF41]/10 bg-[#00FF41]/2 rounded-[3px] space-y-4">
                    <p className="text-xs md:text-sm leading-relaxed text-[#00FF41]/90">
                      I’m <strong className="text-white font-semibold">K R Aarshanth</strong>, a second-year Computer Science and Engineering student specializing in <strong className="text-[#00E5FF] font-semibold">Cyber Security</strong> at Kalvium × AMET University.
                    </p>
                    <p className="text-xs md:text-sm leading-relaxed text-[#00FF41]/80">
                      My journey into technology did not begin with mastery — it began with curiosity. A simple question led everything: <span className="text-[#00E5FF] italic font-semibold">How do systems work beneath the surface?</span> That curiosity pushed me into programming, where I started understanding how applications are built, how data flows through systems, and how every line of code shapes user experiences.
                    </p>
                    <p className="text-xs md:text-sm leading-relaxed text-[#00FF41]/80">
                      But the deeper I went, the more I realized something important: <strong className="text-[#00E5FF] font-semibold">Every system has a hidden layer.</strong> Behind every interface lies architecture. Behind every feature lies logic. And behind every system lies vulnerability. That realization pulled me toward Cybersecurity.
                    </p>
                    <p className="text-xs md:text-sm leading-relaxed text-[#00FF41]/85">
                      Like every learner, my path has been filled with unfinished ideas, failed experiments, broken code, deployment issues, endless debugging sessions, and moments of uncertainty. There were times where progress felt invisible. But growth often hides in struggle. Every failed build taught me resilience. Every bug taught me patience. Every mistake taught me how to think better. What started with simple frontend projects slowly expanded into backend systems, security workflows, AI-integrated applications, and full-stack architectures. Over time, I stopped just building things — <span className="text-white glow-text font-bold">I started understanding them.</span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 bg-red-950/5 border border-red-500/20 rounded-[2px] shadow-[0_0_8px_rgba(239,68,68,0.05)]">
                        <div className="font-mono text-[9px] text-red-500 tracking-wider mb-1">■ RED TEAMING & CYBER</div>
                        <p className="text-[10.5px] text-red-200/75 leading-snug">Emulating adversarial behavior, attack surface mappings, and vulnerability discovery.</p>
                      </div>
                      <div className="p-3 bg-[#050505]/60 border border-[#00FF41]/15 rounded-[2px]">
                        <div className="font-mono text-[9px] text-[#00E5FF] tracking-wider mb-1">■ ARTIFICIAL INTELLIGENCE</div>
                        <p className="text-[10.5px] text-[#00FF41]/75 leading-snug">Exploring intelligent systems to improve security workflows.</p>
                      </div>
                      <div className="p-3 bg-[#050505]/60 border border-[#00FF41]/15 rounded-[2px]">
                        <div className="font-mono text-[9px] text-[#00E5FF] tracking-wider mb-1">■ FULL STACK DEVELOPMENT</div>
                        <p className="text-[10.5px] text-[#00FF41]/75 leading-snug">Building complete, secure systems from frontend to backend.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <div className="font-mono text-[9px] tracking-widest text-[#00E5FF] uppercase border-b border-[#00FF41]/10 pb-1">
                        [ Background ]
                      </div>
                      <p className="text-xs md:text-[12.5px] leading-relaxed text-[#00FF41]/85">
                        My foundation isn’t just academic—it’s built through constant experimentation with real tools like Linux, Docker, Node.js, and security tools such as Nmap and Wireshark. I’ve worked on projects ranging from full-stack web applications to security-focused systems, and participated in hackathons where I learned to build under pressure and think practically rather than theoretically.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="font-mono text-[9px] tracking-widest text-[#00E5FF] uppercase border-b border-[#00FF41]/10 pb-1">
                        [ Evolution ]
                      </div>
                      <p className="text-xs md:text-[12.5px] leading-relaxed text-[#00FF41]/85">
                        I didn’t start with deep expertise—I started with curiosity. Early on, I explored general web development, but over time, I gravitated toward cybersecurity and systems thinking, where logic, problem-solving, and real-world impact intersect. My growth has been hands-on: from building simple websites to developing API-driven applications and custom systems.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="font-mono text-[9px] tracking-widest text-[#00E5FF] uppercase border-b border-[#00FF41]/10 pb-1">
                        [ Drive ]
                      </div>
                      <p className="text-xs md:text-[12.5px] leading-relaxed text-[#00FF41]/85">
                        What pushes me is simple: I want to build things that actually matter and work in the real world. I’m not interested in surface-level knowledge. I aim to understand systems deeply, build with intent, and continuously move from "I know this" to "I can execute this" under real constraints.
                      </p>
                      <div className="inline-flex items-center gap-2 border border-red-500/25 bg-red-950/20 px-3 py-1.5 rounded-[2px] mt-2 w-max shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full blink" />
                        <span className="font-mono text-[9px] text-red-400 tracking-wider uppercase font-semibold">
                          Red Team Intern @ Cyart Tech (2026)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <CyberSidebar slideIndex={1} />
              </div>
            </div>

            {/* Slide 2: Experience */}
            <div
              className="h-screen w-full snap-start snap-always flex-shrink-0 relative flex flex-col justify-center items-center px-4 md:px-14 pt-20 pb-8 lg:pt-24 lg:pb-12"
            >
              <div className={`cyber-panel max-w-5xl w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-160px)] overflow-y-auto cyber-scrollbar transition-all duration-600 ${
                isSlideActive(2)
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}>
                <div className="flex-1">
                  <div className="font-mono text-[10px] tracking-[3.5px] text-[#00E5FF] uppercase mb-3">
                    Threat Operations
                  </div>
                  <h2 className="font-bold text-4xl md:text-5xl uppercase leading-none mb-6">
                    <ScrambleText text="Focus & Experience" trigger={isSlideActive(2)} />
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left side: Experience cards */}
                    <div className="flex flex-col gap-4">
                      <div className="font-mono text-[11px] tracking-wider text-[#00E5FF] border-b border-[#00FF41]/15 pb-1.5 mb-2 uppercase font-semibold">
                        [ Cyber & Academic Roles ]
                      </div>
                      <div className="space-y-4">
                        {experiences.map((exp, idx) => {
                          const isRedTeaming = exp.role.includes("Red Teaming");
                          const themeColor = exp.color || "#00FF41";
                          const borderClass = isRedTeaming 
                            ? "border-red-500/25 hover:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.08)] bg-red-950/5" 
                            : "border-[#00FF41]/10 hover:border-[#00FF41]/30 hover:shadow-[0_0_15px_rgba(0,255,65,0.02)]";
                          const arrowColor = isRedTeaming ? "text-red-500" : "text-[#00FF41]";
                          const pointTextColor = isRedTeaming ? "text-red-200/80" : "text-[#00FF41]/80";
                          const subColor = isRedTeaming ? "text-red-400" : "text-[#00E5FF]";
                          const periodColor = isRedTeaming ? "text-red-500/60" : "text-[#00FF41]/50";
                          
                          return (
                            <div 
                              key={idx} 
                              className={`cyber-card p-5 rounded-[3px] flex gap-4 bg-black/60 border transition-all duration-300 ${borderClass}`}
                            >
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 animate-pulse"
                                style={{
                                  backgroundColor: themeColor,
                                  boxShadow: `0 0 8px ${themeColor}`
                                }}
                              />
                              <div>
                                <div className={`font-bold ${isRedTeaming ? 'text-red-100' : 'text-white'} text-sm md:text-base flex items-center gap-2`}>
                                  {exp.role}
                                  {isRedTeaming && (
                                    <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-[2px] bg-red-950 border border-red-500/30 text-red-500 uppercase animate-pulse">
                                      OFFENSIVE
                                    </span>
                                  )}
                                </div>
                                <div className={`font-mono text-xs ${subColor} font-semibold mt-0.5`}>{exp.organization}</div>
                                <div className={`font-mono text-[9.5px] ${periodColor} uppercase mt-0.5 tracking-wider`}>{exp.period}</div>
                                <div className="mt-3 space-y-1.5">
                                  {exp.points.map((pt, pIdx) => (
                                    <div key={pIdx} className={`text-xs ${pointTextColor} flex gap-2`}>
                                      <span className={arrowColor}>›</span>
                                      <span>{pt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right side: Focus & Leadership */}
                    <div className="flex flex-col gap-6">
                      {/* Focus Column */}
                      <div className="flex flex-col gap-3">
                        <div className="font-mono text-[11px] tracking-wider text-[#00E5FF] border-b border-[#00FF41]/15 pb-1.5 mb-2 uppercase font-semibold">
                          [ Strategic Focus ]
                        </div>
                        <p className="text-xs text-[#00FF41]/85 leading-relaxed">
                          My current focus is centered around building strong technical foundations while expanding into advanced system-level thinking. <strong className="text-white">I believe mastery starts with fundamentals.</strong> That’s why I spend significant time understanding:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-[#00FF41]/80 font-mono">
                          <li className="flex items-center gap-1.5"><span className="text-[#00E5FF]">■</span> Linux system behavior</li>
                          <li className="flex items-center gap-1.5"><span className="text-[#00E5FF]">■</span> Network recon & enumeration</li>
                          <li className="flex items-center gap-1.5"><span className="text-[#00E5FF]">■</span> Web app vulnerabilities</li>
                          <li className="flex items-center gap-1.5"><span className="text-[#00E5FF]">■</span> Authentication security</li>
                          <li className="flex items-center gap-1.5"><span className="text-[#00E5FF]">■</span> Threat analysis & automation</li>
                          <li className="flex items-center gap-1.5"><span className="text-[#00E5FF]">■</span> AI security workflows</li>
                          <li className="flex items-center gap-1.5"><span className="text-[#00E5FF]">■</span> Backend API architecture</li>
                          <li className="flex items-center gap-1.5"><span className="text-[#00E5FF]">■</span> Database design & scaling</li>
                        </ul>
                        <p className="text-[11px] text-[#00FF41]/70 leading-relaxed italic mt-1 border-l border-[#00FF41]/30 pl-2 font-mono">
                          "My long-term goal is to become a Cybersecurity Engineer and Advanced Systems Builder — someone capable of understanding, building, breaking, securing, and optimizing systems at a professional level."
                        </p>
                      </div>

                      {/* Leadership Column */}
                      <div className="flex flex-col gap-3">
                        <div className="font-mono text-[11px] tracking-wider text-[#00E5FF] border-b border-[#00FF41]/15 pb-1.5 mb-2 uppercase font-semibold">
                          [ Leadership & Ownership ]
                        </div>
                        <p className="text-xs text-[#00FF41]/85 leading-relaxed">
                          Leadership, for me, was never about titles. <strong className="text-white">It was built through responsibility, teamwork, and showing up under pressure.</strong> I’ve worked in environments where deadlines were tight, resources were limited, and expectations were high.
                        </p>
                        <div className="p-3 bg-[#00FF41]/2 border border-[#00FF41]/10 rounded-[2px] text-[11px] text-[#00FF41]/80 font-mono space-y-1">
                          <div className="text-white font-bold uppercase mb-1 text-[10px]">DEPARTMENTAL ROLE:</div>
                          <p className="text-[10.5px]">Served as <strong className="text-[#00E5FF]">Documentation Archivist for the CSE Department</strong> at Kalvium × AMET University (2025–2026), managing academic records, project archives, and structure.</p>
                        </div>
                        <p className="text-[11px] text-[#00E5FF] font-semibold font-mono uppercase tracking-wider text-center mt-1">
                          “Taking responsibility when things break. Staying consistent when motivation fades. And pushing forward.”
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <CyberSidebar slideIndex={2} />
              </div>
            </div>

            {/* Slide 3: Skills */}
            <div
              className="h-screen w-full snap-start snap-always flex-shrink-0 relative flex flex-col justify-center items-center px-4 md:px-14 pt-20 pb-8 lg:pt-24 lg:pb-12"
            >
              <div className={`cyber-panel max-w-5xl w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-160px)] overflow-y-auto cyber-scrollbar transition-all duration-600 ${
                isSlideActive(3)
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-[10px] tracking-[3.5px] text-[#00E5FF] uppercase mb-3">
                      Tooling Matrix
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h2 className="font-bold text-4xl md:text-5xl uppercase leading-none">
                        <ScrambleText text="Skills Matrix" trigger={isSlideActive(3)} />
                      </h2>
                      <button
                        onClick={() => setIsLogsModalOpen(true)}
                        className="font-mono text-[9px] tracking-widest uppercase border border-[#00FF41]/40 bg-[#00FF41]/5 hover:bg-[#00FF41]/20 text-[#00FF41] px-3 py-1.5 rounded-[2px] transition-all duration-300 cursor-pointer self-start sm:self-auto flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,255,65,0.05)] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
                        [ VIEW RAW SYSTEM LOGS ]
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[calc(100vh-420px)] overflow-y-auto pr-2 cyber-scrollbar">
                      {skillCategories.map((cat, idx) => (
                        <div key={idx} className="flex flex-col">
                          <div className="font-mono text-[11px] tracking-wider text-[#00E5FF] border-b border-[#00FF41]/15 pb-1.5 mb-4 uppercase font-semibold">
                            {cat.title}
                          </div>
                          <div className="space-y-3">
                            {cat.skills.map((sk, sIdx) => (
                              <div key={sIdx} className="flex flex-col">
                                <div className="flex justify-between items-center text-xs text-[#00FF41]/90 mb-1">
                                  <span>{sk.name}</span>
                                  <span className="font-mono text-[10px] text-[#00FF41]">{sk.level}%</span>
                                </div>
                                <div className="h-[3px] bg-[#00FF41]/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full sb-fill"
                                    style={{ width: isSlideActive(3) ? `${sk.level}%` : "0%" }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {cat.tools.map((tool, tIdx) => (
                              <span key={tIdx} className="font-mono text-[9.5px] tracking-wider text-[#00FF41] border border-[#00FF41]/20 bg-[#050505]/80 px-2.5 py-0.5 rounded">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Terminal Sandbox embedded directly inside Skills Slide */}
                  <div className="mt-4">
                    <TerminalSandbox />
                  </div>
                </div>

                <CyberSidebar slideIndex={3} />
              </div>
            </div>

            {/* Slide 4: Operations */}
            <div
              className="h-screen w-full snap-start snap-always flex-shrink-0 relative flex flex-col justify-center items-center px-4 md:px-14 pt-20 pb-8 lg:pt-24 lg:pb-12"
            >
              <div className={`cyber-panel max-w-5xl w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-160px)] overflow-y-auto cyber-scrollbar transition-all duration-600 ${
                isSlideActive(4)
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}>
                <div className="flex-1">
                  <div className="font-mono text-[10px] tracking-[3.5px] text-[#00E5FF] uppercase mb-3">
                    Engineered Defenses
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#00FF41]/10 pb-4">
                    <h2 className="font-bold text-4xl md:text-5xl uppercase leading-none">
                      <ScrambleText text="Operations" trigger={isSlideActive(4)} />
                    </h2>
                    
                    {/* View mode selector */}
                    <div className="flex items-center border border-[#00FF41]/20 bg-black/50 p-0.5 rounded-[2px] overflow-hidden self-start sm:self-auto shrink-0">
                      <button
                        onClick={() => setOperationsMode("grid")}
                        className={`font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-[1px] transition-all duration-300 cursor-pointer ${
                          operationsMode === "grid"
                            ? "bg-[#00FF41] text-black font-bold"
                            : "text-[#00FF41]/70 hover:text-[#00FF41] hover:bg-[#00FF41]/5"
                        }`}
                      >
                        GRID_DEPLOY
                      </button>
                      <button
                        onClick={() => setOperationsMode("topology")}
                        className={`font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-[1px] transition-all duration-300 cursor-pointer ${
                          operationsMode === "topology"
                            ? "bg-[#00FF41] text-black font-bold"
                            : "text-[#00FF41]/70 hover:text-[#00FF41] hover:bg-[#00FF41]/5"
                        }`}
                      >
                        NET_TOPOLOGY
                      </button>
                    </div>
                  </div>
                  
                  {operationsMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-2 cyber-scrollbar">
                      {projects.map((proj, idx) => (
                        <div key={idx} className="pc-wrap w-full h-[120px] cursor-none relative">
                          <div className="pc w-full h-full relative transition-transform duration-500 ease-out">
                            {/* Front Face */}
                            <div className="pc-front absolute inset-0 rounded-[3px] bg-black/80 border border-[#00FF41]/10 p-4 flex flex-col justify-between cyber-card">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{proj.icon}</span>
                                  <div className="font-bold text-white text-xs md:text-sm">{proj.name}</div>
                                </div>
                                <div className="text-[10px] text-[#00E5FF] font-mono mt-0.5">{proj.sub}</div>
                                <p className="text-[10px] text-[#00FF41]/75 line-clamp-2 mt-1 leading-snug">{proj.desc}</p>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {proj.tags.slice(0, 3).map((tag, tIdx) => (
                                  <span key={tIdx} className="text-[8px] font-mono bg-[#00FF41]/5 border border-[#00FF41]/15 text-[#00FF41] px-1.5 py-0.5 rounded-[1px]">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {/* Back Face */}
                            <div className="pc-back absolute inset-0 rounded-[3px] bg-black/95 border border-[#00E5FF]/20 p-4 flex flex-col justify-center items-center gap-2.5 cyber-card text-center">
                              <div className="font-bold text-white text-xs">{proj.name}</div>
                              <p className="text-[9px] text-[#00FF41]/80 leading-normal max-w-[190px]">{proj.backDesc}</p>
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] font-mono border border-[#00FF41]/30 hover:border-[#00FF41] text-[#00FF41] px-3 py-1 rounded-[2px] transition-colors"
                              >
                                View Repository →
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <NetworkGraph />
                  )}
                </div>

                <CyberSidebar slideIndex={4} />
              </div>
            </div>

            {/* Slide 5: Timeline */}
            <div
              className="h-screen w-full snap-start snap-always flex-shrink-0 relative flex flex-col justify-center items-center px-4 md:px-14 pt-20 pb-8 lg:pt-24 lg:pb-12"
            >
              <div className={`cyber-panel max-w-5xl w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-160px)] overflow-y-auto cyber-scrollbar transition-all duration-600 ${
                isSlideActive(5)
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}>
                <div className="flex-1 flex flex-col lg:flex-row gap-6">
                  {/* Left Column: Timeline list */}
                  <div className="flex-1">
                    <div className="font-mono text-[10px] tracking-[3.5px] text-[#00E5FF] uppercase mb-3">
                      Incident Timeline
                    </div>
                    <h2 className="font-bold text-4xl md:text-5xl uppercase leading-none mb-6">
                      <ScrambleText text="Timeline" trigger={isSlideActive(5)} />
                    </h2>
                    
                    <div className="flex flex-col gap-0 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 cyber-scrollbar">
                      {timelineItems.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00FF41] border-2 border-[#00FF41]/20 shadow-[0_0_8px_#00FF41] flex-shrink-0" />
                            {idx < timelineItems.length - 1 && (
                              <div className="w-[1px] flex-grow bg-[#00FF41]/15 min-h-[40px] my-1" />
                            )}
                          </div>
                          <div className="pb-5">
                            <div className="text-[9px] font-mono text-[#00E5FF] uppercase tracking-wider">{item.year}</div>
                            <div className="text-white text-xs md:text-sm font-semibold mt-0.5">{item.title}</div>
                            <p className="text-[11px] md:text-xs text-[#00FF41]/70 leading-relaxed mt-1">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Decryption Game */}
                  <div className="flex-1 flex flex-col justify-start">
                    <div className="font-mono text-[10px] tracking-[3.5px] text-[#FF8A3D] uppercase mb-3">
                      Adversarial Decryption
                    </div>
                    <h2 className="font-bold text-4xl md:text-5xl uppercase leading-none mb-6">
                      CRYPT_OP
                    </h2>
                    <div className="flex-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 cyber-scrollbar">
                      <CyberDecoder onThemeChange={handleThemeChange} />
                    </div>
                  </div>
                </div>

                <CyberSidebar slideIndex={5} />
              </div>
            </div>

            {/* Slide 6: Contact */}
            <div
              className="h-screen w-full snap-start snap-always flex-shrink-0 relative flex flex-col justify-center items-center px-4 md:px-14 pt-20 pb-8 lg:pt-24 lg:pb-12"
            >
              <div className={`cyber-panel max-w-5xl w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-160px)] overflow-y-auto cyber-scrollbar transition-all duration-600 ${
                isSlideActive(6)
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}>
                <div className="flex-1 flex flex-col justify-center relative">
                  {/* Subtle pulsing background glow */}
                  <div className="absolute -left-12 -top-10 w-80 h-48 rounded-full bg-radial from-[#00FF41]/5 to-transparent animate-pulse pointer-events-none" />

                  <div className="relative z-10">
                    <div className="font-mono text-[10px] tracking-[3.5px] text-[#00E5FF] uppercase mb-3">
                      Secure Channel
                    </div>
                    <h2 className="font-bold text-4xl md:text-5xl uppercase leading-none mb-4">
                      <ScrambleText text="Get in Touch" trigger={isSlideActive(6)} />
                    </h2>
                    <p className="text-xs md:text-sm text-[#00FF41]/85 max-w-lg leading-relaxed mb-6">
                      Cybersecurity researcher and systems builder open to internship, freelance, and security auditor opportunities. Reach out for secure collaborations.
                    </p>

                    <div className="flex flex-col gap-4">
                      <a
                        href="mailto:aarshanth5119@gmail.com"
                        className="inline-flex items-center gap-3 bg-[#00FF41]/4 border border-[#00FF41]/25 hover:border-[#00FF41] text-white px-5 py-3 rounded-[2px] transition-all duration-300 max-w-max hover:shadow-[0_0_12px_rgba(0,255,65,0.4)] font-mono text-xs md:text-sm"
                      >
                        <Mail className="w-4 h-4 text-[#00FF41]" />
                        <span>aarshanth5119@gmail.com</span>
                      </a>

                      <div className="inline-flex items-center gap-2 border border-[#00FF41]/20 bg-[#00FF41]/4 px-3 py-1.5 rounded-[2px] w-max">
                        <span className="w-1.5 h-1.5 bg-[#00FF41] rounded-full animate-ping" />
                        <span className="font-mono text-[9px] text-[#00FF41] tracking-wider uppercase font-semibold">
                          Active System Auditor
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-8 font-mono text-[10px] md:text-xs">
                      <a
                        href="https://github.com/Aarsh29"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00FF41]/50 hover:text-[#00FF41] transition-colors py-1"
                      >
                        GitHub
                      </a>
                      <span className="h-3.5 w-[1px] bg-[#00FF41]/15" />
                      <a
                        href="https://www.linkedin.com/in/aarsh2906/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00FF41]/50 hover:text-[#00FF41] transition-colors py-1"
                      >
                        LinkedIn
                      </a>
                      <span className="h-3.5 w-[1px] bg-[#00FF41]/15" />
                      <a
                        href="tel:+917550028237"
                        className="text-[#00FF41]/50 hover:text-[#00FF41] transition-colors py-1"
                      >
                        +91 75500 28237
                      </a>
                    </div>
                  </div>
                </div>

                <CyberSidebar slideIndex={6} />
              </div>
            </div>
            {/* Slide 0 (Clone) */}
            <div
              className="h-screen w-full snap-start snap-always flex-shrink-0 relative flex flex-col justify-center items-center px-4 md:px-14 pt-20 pb-8 lg:pt-24 lg:pb-12"
            >
              <div className={`max-w-4xl w-full flex flex-col items-center justify-center text-center transition-all duration-600 ${
                isSlideActive(0)
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}>
                <div className="font-mono text-[9px] md:text-[10px] tracking-[1.5px] md:tracking-[3px] text-red-500 uppercase mb-5 flex flex-wrap items-center justify-center gap-1.5 md:gap-2 font-bold animate-pulse text-center leading-relaxed max-w-xs sm:max-w-md md:max-w-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                  <span>Cybersecurity Intern (Red Teaming) @ Cyart Tech LLP  ·  Remote (Gujarat, India)</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
                  <div className="flex-shrink-0 relative">
                    <SecureAvatar />
                  </div>
                  <div className="text-center md:text-left max-w-lg flex flex-col items-center md:items-start">
                    <h1 className="font-bold text-4xl md:text-6xl tracking-tight leading-[0.95] text-white uppercase mb-4">
                       <ScrambleText text="K R Aarshanth" trigger={isSlideActive(0)} />
                    </h1>
                    <div className="font-mono text-xs md:text-sm text-[#00FF41]/90 flex items-center justify-center md:justify-start min-h-[24px]">
                      <span>I am a&nbsp;</span>
                      <span className="text-[#00FF41] glow-text font-bold">{roleText}</span>
                      <span className="w-[2px] h-3.5 bg-[#00FF41] ml-0.5 blink" />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
                      <span className="text-[10px] font-mono tracking-wider text-red-500 border border-red-500/40 bg-red-950/10 px-3 py-1 rounded-[2px] font-bold shadow-[0_0_8px_rgba(239,68,68,0.15)]">
                        RED TEAMING
                      </span>
                      <span className="text-[10px] font-mono tracking-wider text-[#00FF41] border border-[#00FF41]/35 bg-[#050505]/80 px-3 py-1 rounded-[2px]">
                        Adversarial Emulation
                      </span>
                      <span className="text-[10px] font-mono tracking-wider text-[#00E5FF] border border-[#00E5FF]/35 bg-[#050505]/80 px-3 py-1 rounded-[2px]">
                        B.Tech CSE (Cyber Security)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT SIDE HUD COUNTER */}
          <div className="fixed right-6 md:right-14 bottom-14 z-30 pointer-events-none hidden lg:flex flex-col items-end gap-1 font-mono text-[8px] tracking-widest text-[#00FF41]/25 select-none">
            {NAV_LABELS.map((label, idx) => (
              <span
                key={idx}
                className={`transition-all duration-300 ${
                  currentSlide === idx ? "text-[#00FF41] glow-text" : ""
                }`}
              >
                {label.toUpperCase()}
              </span>
            ))}
          </div>

          {/* SCROLL HELPER HINT */}
          {currentSlide === 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none font-mono text-[9px] text-[#00FF41]/50 tracking-widest uppercase flex flex-col items-center gap-1">
              <span>Scroll to traverse log matrix</span>
              <div className="w-1.5 h-1.5 bg-[#00FF41] rounded-full animate-bounce" />
            </div>
          )}

          {/* COMMAND PALETTE GATEWAY */}
          <CommandPalette onNavigate={handleNavClick} currentSlide={currentSlide} />

          {/* SYSTEM LOGS DIAGNOSTICS OVERLAY */}
          <SystemLogsModal isOpen={isLogsModalOpen} onClose={() => setIsLogsModalOpen(false)} />

          {/* TACTICAL AUDIO CO-PROCESSOR CONTROLLER */}
          <AudioController />
        </>
      )}
    </div>
  );
}
