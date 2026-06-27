import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Terminal, ChevronRight, Cpu, Folder, Calendar, Shield, Bookmark, X, Sliders } from "lucide-react";
import { experiences, skillCategories, projects, timelineItems } from "../data";
import { audioSystem } from "../utils/audioSystem";

interface SearchItem {
  id: string;
  name: string;
  category: "Section" | "Project" | "Skill" | "Experience" | "Timeline";
  description?: string;
  meta?: string;
  slideIndex: number;
}

interface CommandPaletteProps {
  onNavigate: (slideIndex: number) => void;
  currentSlide: number;
}

export default function CommandPalette({ onNavigate, currentSlide }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [audioSettings, setAudioSettings] = useState(() => audioSystem.getSettings());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Lazy initialize audio system on first user gesture if master is enabled
  useEffect(() => {
    const initOnGesture = () => {
      const settings = audioSystem.getSettings();
      if (settings.master) {
        audioSystem.init();
      }
      window.removeEventListener("click", initOnGesture);
      window.removeEventListener("keydown", initOnGesture);
    };
    window.addEventListener("click", initOnGesture);
    window.addEventListener("keydown", initOnGesture);
    return () => {
      window.removeEventListener("click", initOnGesture);
      window.removeEventListener("keydown", initOnGesture);
    };
  }, []);

  // Sync state changes from other controllers
  useEffect(() => {
    const unsubscribe = audioSystem.subscribe(() => {
      setAudioSettings(audioSystem.getSettings());
    });
    return unsubscribe;
  }, []);

  // Generate complete indexable database for searching
  const searchDatabase = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [
      // Sections
      {
        id: "sec-0",
        name: "Home Node",
        category: "Section",
        description: "Welcome terminal, Cybersecurity Red Teaming introduction",
        meta: "home intro welcome role start main aarshanth red teaming cyart",
        slideIndex: 0,
      },
      {
        id: "sec-1",
        name: "Intel (About)",
        category: "Section",
        description: "Profile specifications, background, CSE interest, certifications",
        meta: "about profile education bio info kalvium amet university chennai",
        slideIndex: 1,
      },
      {
        id: "sec-2",
        name: "Focus (Experience)",
        category: "Section",
        description: "Red Teaming internship and CSE archivist history",
        meta: "experience job work history cyart tech kalvium amet university",
        slideIndex: 2,
      },
      {
        id: "sec-3",
        name: "Tools (Skills)",
        category: "Section",
        description: "Cybersecurity, programming toolchains and metrics",
        meta: "skills stack linux recon nmap programming database cpp java js python",
        slideIndex: 3,
      },
      {
        id: "sec-4",
        name: "Ops (Projects)",
        category: "Section",
        description: "Offensive tooling, detection models and web applications",
        meta: "projects zero hunger connect phishing detection vulnerability scanner password strength checker",
        slideIndex: 4,
      },
      {
        id: "sec-5",
        name: "Timeline (Milestones)",
        category: "Section",
        description: "Chronology of accomplishments, hackathons and milestones",
        meta: "timeline history academic awards makathon kcg hackathon",
        slideIndex: 5,
      },
      {
        id: "sec-6",
        name: "Secure Link (Contact)",
        category: "Section",
        description: "Communication handshake, Email, LinkedIn, Github",
        meta: "contact email phone social media resume linkedin github link",
        slideIndex: 6,
      },
    ];

    // Projects
    projects.forEach((proj, idx) => {
      items.push({
        id: `proj-${idx}`,
        name: proj.name,
        category: "Project",
        description: proj.desc,
        meta: `${proj.sub} ${proj.backDesc} ${proj.tags.join(" ")}`,
        slideIndex: 4,
      });
    });

    // Skills
    skillCategories.forEach((cat, catIdx) => {
      cat.skills.forEach((skill, skillIdx) => {
        items.push({
          id: `skill-${catIdx}-${skillIdx}`,
          name: skill.name,
          category: "Skill",
          description: `Skill capability in ${cat.title}. Tech stack: ${cat.tools.join(", ")}`,
          meta: `${cat.title} ${cat.tools.join(" ")}`,
          slideIndex: 3,
        });
      });
    });

    // Experiences
    experiences.forEach((exp, idx) => {
      items.push({
        id: `exp-${idx}`,
        name: `${exp.role} @ ${exp.organization}`,
        category: "Experience",
        description: exp.points.join(" "),
        meta: `${exp.period} ${exp.points.join(" ")}`,
        slideIndex: 2,
      });
    });

    // Timeline Items
    timelineItems.forEach((time, idx) => {
      items.push({
        id: `time-${idx}`,
        name: `Milestone [${time.year}]: ${time.title}`,
        category: "Timeline",
        description: time.desc,
        meta: `${time.year} ${time.desc}`,
        slideIndex: 5,
      });
    });

    return items;
  }, []);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return searchDatabase;
    }
    const query = searchQuery.toLowerCase().trim();
    return searchDatabase.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.meta && item.meta.toLowerCase().includes(query))
    );
  }, [searchQuery, searchDatabase]);

  // Handle shortcut trigger Ctrl+K or Cmd+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Set initial focus & reset query on opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      // Restore standard app overflow (which is hidden because of the slide scrolling layout)
      document.body.style.overflow = "hidden";
    }
  }, [isOpen]);

  // Scroll active item into view inside the list
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  // Keyboard navigation within the opened palette
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems.length > 0 && filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelectItem = (item: SearchItem) => {
    onNavigate(item.slideIndex);
    setIsOpen(false);
  };

  const getCategoryIcon = (category: SearchItem["category"]) => {
    switch (category) {
      case "Section":
        return <Terminal className="w-3.5 h-3.5 text-[#00E5FF]" />;
      case "Project":
        return <Folder className="w-3.5 h-3.5 text-red-500" />;
      case "Skill":
        return <Cpu className="w-3.5 h-3.5 text-[#00FF41]" />;
      case "Experience":
        return <Shield className="w-3.5 h-3.5 text-orange-400" />;
      case "Timeline":
        return <Calendar className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const getCategoryTagClass = (category: SearchItem["category"]) => {
    switch (category) {
      case "Section":
        return "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30";
      case "Project":
        return "text-red-500 bg-red-500/10 border-red-500/30";
      case "Skill":
        return "text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/30";
      case "Experience":
        return "text-orange-400 bg-orange-400/10 border-orange-400/30";
      case "Timeline":
        return "text-purple-400 bg-purple-400/10 border-purple-400/30";
    }
  };

  if (!isOpen) {
    return (
      // Inline trigger floating tip to inform users about Ctrl+K
      <div className="fixed bottom-6 left-6 z-30 flex items-center gap-2 font-mono text-[9px] text-[#00FF41]/60 bg-[#050505]/80 border border-[#00FF41]/20 px-3 py-1.5 rounded-[2px] backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,65,0.05)] select-none">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-ping" />
        <span>PRESS</span>
        <kbd className="px-1.5 py-0.5 bg-[#111] border border-[#00FF41]/40 text-[#00FF41] rounded-[2px] font-bold text-[8px] tracking-wide">CTRL + K</kbd>
        <span>TO SEARCH ENCLAVE</span>
        <button
          onClick={() => setIsOpen(true)}
          className="ml-2 px-1.5 py-0.5 bg-[#00FF41]/10 hover:bg-[#00FF41]/30 border border-[#00FF41]/30 text-[#00FF41] rounded-[2px] transition-colors font-bold pointer-events-auto"
        >
          OPEN
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 md:px-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#050505]/85 backdrop-blur-md pointer-events-auto transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Main Palette Box */}
      <div
        id="command-palette-modal"
        ref={containerRef}
        className="relative w-full max-w-2xl bg-[#080808] border border-[#00FF41]/30 rounded-[4px] shadow-[0_0_50px_rgba(0,255,65,0.15)] overflow-hidden font-mono text-xs flex flex-col pointer-events-auto max-h-[70vh] animate-[fadeIn_0.15s_ease-out]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3.5 border-b border-[#00FF41]/25 px-4 py-3 bg-[#0c0c0c]">
          <Search className="w-4 h-4 text-[#00FF41] animate-pulse shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type search queries (e.g. nmap, cyber, project, zero hunger)..."
            className="flex-1 bg-transparent border-none outline-none text-[#00FF41] placeholder-[#00FF41]/30 text-xs py-0.5 leading-relaxed"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-[#141414] border border-[#00FF41]/20 rounded text-[9px] text-[#00FF41]/60">↑↓ Nav</kbd>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-[#141414] border border-[#00FF41]/20 rounded text-[9px] text-[#00FF41]/60">↵ Enter</kbd>
            <button
              onClick={() => {
                audioSystem.playClickSound();
                setShowAudioSettings((prev) => !prev);
              }}
              className={`p-1 transition-all duration-150 rounded cursor-pointer border ${
                showAudioSettings
                  ? "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30"
                  : "text-[#00FF41]/40 hover:text-[#00FF41] hover:bg-[#00FF41]/10 border-transparent"
              }`}
              title="System Audio Configuration"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                audioSystem.playClickSound();
                setIsOpen(false);
              }}
              className="text-[#00FF41]/40 hover:text-[#00FF41] p-1 transition-colors hover:bg-[#00FF41]/10 rounded cursor-pointer"
              title="Close Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
 
        {/* Audio settings controller */}
        {showAudioSettings && (
          <div className="border-b border-[#00FF41]/25 bg-[#0a0a0a] p-4 font-mono text-[10px] space-y-4 animate-[slideDown_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-[#00FF41]/15 pb-2">
              <span className="text-[#00E5FF] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
                SYSTEM AUDIO CO-PROCESSOR
              </span>
              <button
                onClick={() => {
                  const newMaster = !audioSettings.master;
                  audioSystem.setMasterActive(newMaster);
                  setAudioSettings(audioSystem.getSettings());
                  if (newMaster) {
                    // Play a pleasant welcome chime when audio system comes online!
                    audioSystem.playSecurityHandshake();
                  } else {
                    audioSystem.playClickSound();
                  }
                }}
                className={`text-[8.5px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-[1px] border transition-all duration-150 cursor-pointer ${
                  audioSettings.master
                    ? "bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "bg-red-950/25 border-red-500/50 text-red-400"
                }`}
              >
                {audioSettings.master ? "[ AUDIO ONLINE ]" : "[ AUDIO OFFLINE ]"}
              </button>
            </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hum control block */}
              <div className={`p-2.5 border rounded-[2px] space-y-2.5 transition-opacity ${audioSettings.master ? "opacity-100 border-[#00FF41]/20" : "opacity-40 border-[#00FF41]/5 pointer-events-none"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[#00FF41]/80 font-bold uppercase">1. Cinematic BGM (Music)</span>
                  <input
                    type="checkbox"
                    checked={audioSettings.hum}
                    disabled={!audioSettings.master}
                    onChange={(e) => {
                      audioSystem.setHumActive(e.target.checked);
                      setAudioSettings(audioSystem.getSettings());
                      audioSystem.playClickSound();
                    }}
                    className="accent-[#00FF41] h-3 w-3 cursor-pointer"
                  />
                </div>
                <p className="text-[8.5px] text-white/50 leading-relaxed">
                  Procedurally synthesized cybersecurity movie ambient background soundtrack loops.
                </p>

                {/* Soundtrack switcher buttons */}
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
                        onClick={() => {
                          audioSystem.setBgmPreset(preset);
                          setAudioSettings(audioSystem.getSettings());
                        }}
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

                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-[#00E5FF]">
                    <span>VOLUME MATRIX</span>
                    <span>{Math.round(audioSettings.humVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.3"
                    step="0.01"
                    value={audioSettings.humVolume}
                    disabled={!audioSettings.master || !audioSettings.hum}
                    onChange={(e) => {
                      audioSystem.setHumVolume(parseFloat(e.target.value));
                      setAudioSettings(audioSystem.getSettings());
                    }}
                    className="w-full accent-[#00FF41] h-1 bg-[#111] rounded"
                  />
                </div>
              </div>
 
              {/* Data-Stream Pings control block */}
              <div className={`p-2.5 border rounded-[2px] space-y-2.5 transition-opacity ${audioSettings.master ? "opacity-100 border-[#00FF41]/20" : "opacity-40 border-[#00FF41]/5 pointer-events-none"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[#00FF41]/80 font-bold uppercase">2. Telemetry Pings</span>
                  <input
                    type="checkbox"
                    checked={audioSettings.pings}
                    disabled={!audioSettings.master}
                    onChange={(e) => {
                      audioSystem.setPingsActive(e.target.checked);
                      setAudioSettings(audioSystem.getSettings());
                      audioSystem.playClickSound();
                    }}
                    className="accent-[#00FF41] h-3 w-3 cursor-pointer"
                  />
                </div>
                <p className="text-[8.5px] text-white/50 leading-relaxed">
                  Random organic sine wave pings simulating dynamic network activity logs.
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-[#00E5FF]">
                    <span>GAIN COEFFICIENT</span>
                    <span>{Math.round(audioSettings.pingVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.2"
                    step="0.01"
                    value={audioSettings.pingVolume}
                    disabled={!audioSettings.master || !audioSettings.pings}
                    onChange={(e) => {
                      audioSystem.setPingVolume(parseFloat(e.target.value));
                      setAudioSettings(audioSystem.getSettings());
                    }}
                    className="w-full accent-[#00FF41] h-1 bg-[#111] rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Matches Count */}
        <div className="px-4 py-1.5 bg-[#0e0e0e] border-b border-[#00FF41]/10 flex items-center justify-between text-[9px] text-[#00FF41]/50 tracking-wider">
          <span>SECURE INDEX ENCLAVE DATABASE SEARCH v1.2</span>
          <span>{filteredItems.length} RECORD{filteredItems.length !== 1 ? "S" : ""} FOUND</span>
        </div>

        {/* Search Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto max-h-[45vh] p-2 space-y-1 scrollbar-thin scrollbar-thumb-[#00FF41]/10 cyber-scrollbar"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-[2px] transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 border ${
                    isSelected
                      ? "bg-[#00FF41]/10 border-[#00FF41]/40 text-white"
                      : "bg-[#0a0a0a]/40 border-transparent text-[#00FF41]/75 hover:border-[#00FF41]/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 flex items-center justify-center p-1.5 rounded bg-black/50 border border-white/5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold tracking-wide truncate ${isSelected ? "text-[#00FF41]" : "text-white/90"}`}>
                          {item.name}
                        </span>
                        <span
                          className={`text-[8px] font-semibold px-1.5 py-0.25 rounded border uppercase shrink-0 font-mono tracking-widest ${getCategoryTagClass(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </div>
                      {item.description && (
                        <p className={`text-[10px] mt-0.5 line-clamp-1 leading-normal ${isSelected ? "text-white/70" : "text-white/40"}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1.5 text-[9px] text-[#00FF41]/80 shrink-0 font-bold animate-pulse">
                      <span>STRIKE LINK</span>
                      <ChevronRight className="w-3 h-3 text-[#00FF41]" />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#00FF41]/40 font-mono flex flex-col items-center justify-center gap-2">
              <span className="text-xl">[-]</span>
              <p className="text-[11px] uppercase tracking-widest">No matching security vectors found</p>
              <p className="text-[9px] text-[#00FF41]/25">Try looking for general terms like "linux", "recon", or specific projects</p>
            </div>
          )}
        </div>

        {/* Status Help Footer */}
        <div className="px-4 py-2 bg-[#0c0c0c] border-t border-[#00FF41]/20 flex items-center justify-between text-[8px] text-[#00FF41]/40 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#00FF41] rounded-full animate-ping" />
            <span>ENCLAVE DISCOVERY GATEWAY v2.9</span>
          </div>
          <span>[ESC] TO CLOSE  ·  [↑↓] SELECT  ·  [ENTER] NAVIGATE</span>
        </div>
      </div>
    </div>
  );
}
