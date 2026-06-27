import React, { useState, useRef, useEffect } from "react";
import { audioSystem } from "../utils/audioSystem";

interface TerminalLine {
  text: string;
  type: "input" | "system" | "success" | "warn" | "error";
}

export default function TerminalSandbox() {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: "KRA_SEC_PORTFOLIO Terminal v1.0.4", type: "system" },
    { text: "Type 'help' or press Ctrl+H to view available security commands. Ctrl+C clears history.", type: "system" },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [tempInput, setTempInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const commands: Record<string, string | (() => string | TerminalLine[])> = {
    help: () => [
      { text: "Available commands:", type: "system" },
      { text: "  help        - Display command menu", type: "system" },
      { text: "  nmap        - Run a simulated port scan on local nodes", type: "system" },
      { text: "  scan        - Run a fast web vulnerability audit on current session", type: "system" },
      { text: "  logs        - View real-time security log alerts", type: "system" },
      { text: "  cve         - Query the local database for high-severity CVEs", type: "system" },
      { text: "  ping        - Check secure handshaking latency metrics", type: "system" },
      { text: "  ctf         - Display capture the flag security game status", type: "success" },
      { text: "  clear       - Clear terminal window logs", type: "system" },
    ],
    nmap: () => [
      { text: "Starting Nmap 7.92 ( https://nmap.org ) at UTC_SYNC...", type: "system" },
      { text: "Nmap scan report for KRA_ENDPOINT (10.0.12.84)", type: "system" },
      { text: "Host is up (0.012s latency).", type: "success" },
      { text: "Not shown: 997 closed tcp ports (reset)", type: "system" },
      { text: "PORT     STATE    SERVICE", type: "system" },
      { text: "22/tcp   open     ssh       (OpenSSH 8.9p1 Ubuntu)", type: "success" },
      { text: "80/tcp   closed   http", type: "warn" },
      { text: "443/tcp  open     https     (Nginx proxy - SSL verified)", type: "success" },
      { text: "3000/tcp open     dev-srv   (Web server running)", type: "success" },
      { text: "Nmap done: 1 IP address (1 host up) scanned in 0.45 seconds", type: "success" },
    ],
    scan: () => [
      { text: "Initializing OWASP top-10 security scan audit...", type: "system" },
      { text: "[*] Testing Cross-Site Scripting (XSS) filters... PASS", type: "success" },
      { text: "[*] Auditing Session Token HttpOnly flag... Secure", type: "success" },
      { text: "[*] Inspecting Cross-Origin Resource Sharing rules... Strict", type: "success" },
      { text: "[*] Scanning for missing HTTP Hardening Headers...", type: "system" },
      { text: "[!] Warning: Content-Security-Policy (CSP) is unconfigured", type: "warn" },
      { text: "[*] Checking SQL Injection vector points... PASS", type: "success" },
      { text: "Vulnerability Scan Complete: 0 High, 1 Medium vulnerability found.", type: "success" },
    ],
    logs: () => [
      { text: "Reading active secure-channel authorization log database...", type: "system" },
      { text: "Jun 27 04:00:15 secure-auth [WARN]: Failed password for root from 185.220.101.4 port 43812 ssh2", type: "warn" },
      { text: "Jun 27 04:01:22 firewall [ALERT]: Blocked suspicious incoming ICMP ping request from 82.165.2.9", type: "error" },
      { text: "Jun 27 04:03:02 secure-auth [INFO]: SSL key exchange completed successfully for Session ID: KRA_AARSH", type: "success" },
    ],
    cve: () => [
      { text: "Querying CVE Database for critical 2025/2026 advisories:", type: "system" },
      { text: "  CVE-2026-0812 (CRITICAL) - Remote Code Execution in auth nodes. Patch level: 4.", type: "error" },
      { text: "  CVE-2025-9941 (HIGH)     - Buffer overflow in SSH configurations. Hardened in build.", type: "warn" },
      { text: "  CVE-2025-1104 (MEDIUM)   - Cryptographic leak on stale session vectors. Corrected.", type: "system" },
    ],
    ping: () => [
      { text: "PING kra-secure-node.sh (10.0.12.84) 56(84) bytes of data.", type: "system" },
      { text: "64 bytes from 10.0.12.84: icmp_seq=1 ttl=64 time=11.2 ms", type: "success" },
      { text: "64 bytes from 10.0.12.84: icmp_seq=2 ttl=64 time=12.4 ms", type: "success" },
      { text: "64 bytes from 10.0.12.84: icmp_seq=3 ttl=64 time=10.9 ms", type: "success" },
      { text: "--- kra-secure-node.sh ping statistics ---", type: "system" },
      { text: "3 packets transmitted, 3 received, 0% packet loss, time 2004ms", type: "success" },
      { text: "rtt min/avg/max/mdev = 10.92/11.51/12.41/0.65 ms", type: "success" },
    ],
    secret: () => [
      { text: "DECRYPTING HIDDEN CLI SECTORS...", type: "system" },
      { text: "SUCCESS: SEC_FLAG_EXTRACTED_V4", type: "success" },
      { text: "FLAG: KRA{T3RM1NAL_M4ST3R}", type: "success" },
      { text: "Submit this flag in the DECRYPTION CENTER on Slide 5 (Timeline) to unlock the red team theme!", type: "warn" },
    ],
    ctf: () => [
      { text: "--- KRA CTF RECON ACTIVE ---", type: "system" },
      { text: "Decryption Quest has 3 active security flags:", type: "system" },
      { text: "  Flag 1 (Topology)  - Located in Slide 4 D3 network graph nodes.", type: "system" },
      { text: "  Flag 2 (Terminal)  - Located inside this shell. Type 'secret'.", type: "success" },
      { text: "  Flag 3 (Override)  - Cipher stream located inside Slide 5 Decryption Center hints.", type: "system" },
    ],
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    const cleanInput = trimmedInput.toLowerCase();
    if (!cleanInput) return;

    // Save to command history (avoid duplicating the exact last command if typed consecutively)
    setCommandHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === trimmedInput) {
        return prev;
      }
      return [...prev, trimmedInput];
    });
    setHistoryIndex(-1);
    setTempInput("");

    const newHistory = [...history, { text: `> ${input}`, type: "input" as const }];

    if (cleanInput === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    if (commands[cleanInput]) {
      const output = commands[cleanInput];
      if (typeof output === "function") {
        const resolved = output();
        if (Array.isArray(resolved)) {
          setHistory([...newHistory, ...resolved]);
        } else {
          setHistory([...newHistory, { text: resolved, type: "system" }]);
        }
      } else {
        setHistory([...newHistory, { text: output, type: "system" }]);
      }
    } else {
      setHistory([
        ...newHistory,
        { text: `bash: command not found: ${cleanInput}. Type 'help' for available commands.`, type: "error" },
      ]);
    }

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Play satisfying mechanical keystroke audio (ignoring single modifier keys)
    const modifierKeys = ["Shift", "Control", "Alt", "Meta", "CapsLock"];
    if (!modifierKeys.includes(e.key)) {
      audioSystem.playKeyboardClick();
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
      e.preventDefault();
      setHistory([]);
      setInput("");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
      e.preventDefault();
      const helpOutput = (commands.help as () => TerminalLine[])();
      setHistory((prev) => [...prev, { text: `> ^H [Ctrl+H: HELP]`, type: "input" as const }, ...helpOutput]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : historyIndex - 1;
      if (newIndex >= 0) {
        if (historyIndex === -1) {
          setTempInput(input);
        }
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      
      const newIndex = historyIndex + 1;
      if (newIndex < commandHistory.length) {
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput(tempInput);
      }
    }
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  return (
    <div className="w-full h-48 bg-[#0A0A0A] border border-[#00FF41]/20 rounded-[3px] p-4 font-mono text-[10px] md:text-xs flex flex-col shadow-inner overflow-hidden select-none">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-[#00FF41]/15 pb-2 mb-3 text-[#00FF41]/60">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00FF41] blink" />
          SECURE_CLI_SANDBOX // KRA_SEC_PORT
        </span>
        <span className="text-[9px]">ENCRYPTED_SESSION_STRICT</span>
      </div>

      {/* Terminal History Container */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 cyber-scrollbar">
        {history.map((line, idx) => (
          <div
            key={idx}
            className={
              line.type === "input"
                ? "text-white font-medium"
                : line.type === "success"
                ? "text-[#00FF41]"
                : line.type === "warn"
                ? "text-[#FF8A3D]"
                : line.type === "error"
                ? "text-red-400"
                : "text-[#00FF41]/80"
            }
          >
            {line.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Form Input */}
      <form onSubmit={handleCommand} className="flex items-center gap-1 border-t border-[#00FF41]/10 pt-2 mt-1.5">
        <span className="text-[#00FF41] font-bold select-none">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white outline-none border-none placeholder-[#00FF41]/35"
          placeholder="type secure command... (Ctrl+C: Clear | Ctrl+H: Help)"
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
}
