import React, { useEffect, useState } from "react";

interface CyberSidebarProps {
  slideIndex: number;
}

interface SidebarConfig {
  header: string;
  rows: { label: string; value: string; isGreen?: boolean; isCyan?: boolean; isOrange?: boolean }[];
  consoleLogs: string[];
}

const sidebarConfigs: Record<number, SidebarConfig> = {
  1: {
    header: "PROFILE_SYNC",
    rows: [
      { label: "MODULE", value: "SEC_ABOUT_01" },
      { label: "IDENTITY", value: "KRA_RESEARCHER" },
      { label: "CLEARANCE", value: "LEVEL_4", isGreen: true },
      { label: "SECTOR", value: "THREAT_LAB_IN" },
    ],
    consoleLogs: [
      "> decrypting profile database...",
      "> security_focus: web, network, auth",
      "> loading researcher credentials...",
      "> threat_status: monitored",
      "> profile integrity: 100% verified.",
      "> ready."
    ]
  },
  2: {
    header: "SECURITY_AUDIT",
    rows: [
      { label: "ACTIVE_LOG", value: "CYART_02" },
      { label: "ENDPOINTS", value: "SECURED", isGreen: true },
      { label: "FIREWALL", value: "ACTIVE", isGreen: true },
      { label: "SYSTEM_TEST", value: "PASSED", isGreen: true },
    ],
    consoleLogs: [
      "> auditing endpoint controls...",
      "> checking firewall ingress rules...",
      "> zero vulnerable ports exposed.",
      "> integrity_check: OK",
      "> monitoring network interfaces...",
      "> active threat guard: running."
    ]
  },
  3: {
    header: "WEAPONS_STATS",
    rows: [
      { label: "PREF_OS", value: "KALI_LINUX" },
      { label: "SHELL", value: "ZSH / BASH" },
      { label: "VULN_DB", value: "CVE_SYNC_OK", isGreen: true },
      { label: "ANALYSIS", value: "THREAT_RULES" },
    ],
    consoleLogs: [
      "> fetching national vulnerability database...",
      "> parsing local toolchains...",
      "> nmap, wireshark, burp: OK",
      "> load local detection rules...",
      "> scanning scripts configured successfully.",
      "> tools active."
    ]
  },
  4: {
    header: "PROJECT_VAULT",
    rows: [
      { label: "REPOS", value: "5_ACTIVE" },
      { label: "STATUS", value: "SECURE_SYNC", isGreen: true },
      { label: "INTEGRITY", value: "VERIFIED", isGreen: true },
      { label: "HOST", value: "GITHUB" },
    ],
    consoleLogs: [
      "> git pull --rebase origin main...",
      "> hardening source files integrity check...",
      "> code audit: clean of hardcoded secrets.",
      "> repository hashes matched.",
      "> pipeline sync complete."
    ]
  },
  5: {
    header: "TIMELINE_SYNC",
    rows: [
      { label: "START", value: "2024" },
      { label: "CURRENT", value: "2026" },
      { label: "MILESTONES", value: "5_SECTORS" },
      { label: "REF_CLOCK", value: "UTC_SYNC", isGreen: true },
    ],
    consoleLogs: [
      "> fetching archive milestones...",
      "> timeline_check: verified",
      "> synchronizing achievements databases...",
      "> chronology clock matched.",
      "> timeline integrity validated."
    ]
  },
  6: {
    header: "SECURE_LINK",
    rows: [
      { label: "SSL_STATE", value: "ENCRYPTED", isGreen: true },
      { label: "ALGORITHM", value: "ECDH_P256" },
      { label: "CONN_PORT", value: "PORT_443", isGreen: true },
      { label: "INTEGRATION", value: "OPEN", isCyan: true },
    ],
    consoleLogs: [
      "> initializing secure handshake...",
      "> key exchange: completed successfully.",
      "> tunnel encryption: stable",
      "> ping test: latency 24ms",
      "> messaging port: open and ready."
    ]
  }
};

export default function CyberSidebar({ slideIndex }: CyberSidebarProps) {
  const [consoleIndex, setConsoleIndex] = useState(0);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);

  const config = sidebarConfigs[slideIndex];

  useEffect(() => {
    if (!config) return;

    // Reset console simulation when changing configurations
    setConsoleIndex(0);
    setActiveLogs([config.consoleLogs[0]]);

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % config.consoleLogs.length;
      setConsoleIndex(currentIndex);
      setActiveLogs((prevLogs) => {
        const updated = [...prevLogs, config.consoleLogs[currentIndex]];
        return updated.slice(-20); // Prevent state from growing infinitely
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [slideIndex, config]);

  if (!config) return null;

  return (
    <div className="w-full lg:w-56 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-dashed border-[#00FF41]/20 pt-6 lg:pt-0 lg:pl-6 flex flex-col gap-4 font-mono text-xs select-none">
      <div className="bg-[#050505]/40 border border-[#00FF41]/15 rounded-[3px] p-4">
        <div className="text-[#00FF41] font-bold tracking-[2px] uppercase glow-text">
          [ {config.header} ]
        </div>
        <div className="flex flex-col gap-2 mt-3">
          {config.rows.map((row, idx) => (
            <div key={idx} className="flex justify-between border-b border-[#00FF41]/5 pb-1">
              <span className="text-[#00FF41]/50 uppercase">{row.label}:</span>
              <span
                className={
                  row.isGreen
                    ? "text-[#00FF41] font-bold glow-text"
                    : row.isCyan
                    ? "text-[#00E5FF] font-bold glow-cyan"
                    : row.isOrange
                    ? "text-[#FF8A3D] font-bold"
                    : "text-[#00FF41]/80"
                }
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#050505]/40 border border-[#00FF41]/15 p-4 rounded-[3px]">
        <div className="text-[#00FF41] font-bold tracking-[2px] uppercase glow-text">
          [ {config.header} ]
        </div>
        <div className="flex flex-col gap-2 mt-3">
          {config.rows.map((row, idx) => (
            <div key={idx} className="flex justify-between border-b border-[#00FF41]/5 pb-1">
              <span className="text-[#00FF41]/50 uppercase">{row.label}:</span>
              <span
                className={
                  row.isGreen
                    ? "text-[#00FF41] font-bold glow-text"
                    : row.isCyan
                    ? "text-[#00E5FF] font-bold glow-cyan"
                    : row.isOrange
                    ? "text-[#FF8A3D] font-bold"
                    : "text-[#00FF41]/80"
                }
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#050505]/40 border border-[#00FF41]/15 p-4 rounded-[3px] h-24 overflow-hidden flex flex-col gap-1 shadow-inner">
        {activeLogs.slice(-4).map((log, index) => (
          <div key={index} className="truncate">
            {log}
          </div>
        ))}
        <span className="inline-block w-1.5 h-3 bg-[#00FF41] blink mt-1" />
      </div>
    </div>
  );
}
