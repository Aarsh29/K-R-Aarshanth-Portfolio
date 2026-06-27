import React, { useState, useEffect } from "react";
import { Lock, Unlock, Terminal, Shield, RefreshCw, Key, HelpCircle, Eye, EyeOff } from "lucide-react";

interface CyberDecoderProps {
  onThemeChange?: (color: string) => void;
}

export default function CyberDecoder({ onThemeChange }: CyberDecoderProps) {
  const [activeTab, setActiveTab] = useState<"decoder" | "ctf" | "hints">("decoder");
  const [algo, setAlgo] = useState<"rot13" | "base64" | "hex" | "binary" | "reverse">("rot13");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isGlitching, setIsGlitching] = useState(false);

  // CTF States
  const [flagInput, setFlagInput] = useState("");
  const [solvedFlags, setSolvedFlags] = useState<{ [key: string]: boolean }>({
    net: false,
    terminal: false,
    command: false,
  });
  const [ctfFeedback, setCtfFeedback] = useState<{ text: string; type: "success" | "error" | "neutral" }>({
    text: "READY FOR DECRYPTION CHALLENGE SUBMISSION",
    type: "neutral",
  });

  // ROT13 cipher implementation
  const rot13 = (str: string) => {
    return str.replace(/[a-zA-Z]/g, (c) => {
      return String.fromCharCode(
        c.charCodeAt(0) + (c.toLowerCase() < "n" ? 13 : -13)
      );
    });
  };

  // Safe Base64 decoding/encoding
  const encodeBase64 = (str: string) => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return "ERROR: INVALID CHARACTERS FOR BASE64";
    }
  };

  const decodeBase64 = (str: string) => {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch {
      return "ERROR: INVALID BASE64 ENCODED STRING";
    }
  };

  // String to Hex
  const stringToHex = (str: string) => {
    return Array.from(str)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(" ");
  };

  const hexToString = (str: string) => {
    try {
      const cleanHex = str.replace(/\s+/g, "");
      const matches = cleanHex.match(/.{1,2}/g);
      if (!matches) return "";
      return matches.map((byte) => String.fromCharCode(parseInt(byte, 16))).join("");
    } catch {
      return "ERROR: INVALID HEXADECIMAL LOG";
    }
  };

  // String to Binary
  const stringToBinary = (str: string) => {
    return Array.from(str)
      .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" ");
  };

  const binaryToString = (str: string) => {
    try {
      const cleanBin = str.trim().split(/\s+/);
      return cleanBin.map((bin) => String.fromCharCode(parseInt(bin, 2))).join("");
    } catch {
      return "ERROR: INVALID BINARY STREAM";
    }
  };

  // Reverse string
  const reverseString = (str: string) => {
    return str.split("").reverse().join("");
  };

  // Handle live decoding/encoding
  const handleTranslate = (mode: "encode" | "decode") => {
    setIsGlitching(true);
    setTimeout(() => {
      setIsGlitching(false);
      if (!inputText) {
        setOutputText("");
        return;
      }

      let res = "";
      if (mode === "encode") {
        switch (algo) {
          case "rot13":
            res = rot13(inputText);
            break;
          case "base64":
            res = encodeBase64(inputText);
            break;
          case "hex":
            res = stringToHex(inputText);
            break;
          case "binary":
            res = stringToBinary(inputText);
            break;
          case "reverse":
            res = reverseString(inputText);
            break;
        }
      } else {
        switch (algo) {
          case "rot13":
            res = rot13(inputText);
            break;
          case "base64":
            res = decodeBase64(inputText);
            break;
          case "hex":
            res = hexToString(inputText);
            break;
          case "binary":
            res = binaryToString(inputText);
            break;
          case "reverse":
            res = reverseString(inputText);
            break;
        }
      }
      setOutputText(res);
    }, 450);
  };

  // CTF submission validation
  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFlag = flagInput.trim();

    if (!cleanFlag) return;

    if (cleanFlag === "KRA{N3T_W0RK_DEC0D3D}") {
      if (solvedFlags.net) {
        setCtfFeedback({ text: "FLAG ALREADY SUBMITTED & APPLIED!", type: "neutral" });
        return;
      }
      setSolvedFlags((prev) => ({ ...prev, net: true }));
      setCtfFeedback({ text: "DECRYPTION AUTHENTICATED! [CYAN ENCLAVE THEME UNLOCKED]", type: "success" });
      setFlagInput("");
      if (onThemeChange) onThemeChange("cyan");
    } else if (cleanFlag === "KRA{T3RM1NAL_M4ST3R}") {
      if (solvedFlags.terminal) {
        setCtfFeedback({ text: "FLAG ALREADY SUBMITTED & APPLIED!", type: "neutral" });
        return;
      }
      setSolvedFlags((prev) => ({ ...prev, terminal: true }));
      setCtfFeedback({ text: "root ADVERSARY ACCESS GRANTED! [CRIMSON HACK THEME UNLOCKED]", type: "success" });
      setFlagInput("");
      if (onThemeChange) onThemeChange("red");
    } else if (cleanFlag === "KRA{COMM4ND_ACCE$$}") {
      if (solvedFlags.command) {
        setCtfFeedback({ text: "FLAG ALREADY SUBMITTED & APPLIED!", type: "neutral" });
        return;
      }
      setSolvedFlags((prev) => ({ ...prev, command: true }));
      setCtfFeedback({ text: "MAINFRAME SYNTAX OVERRIDE! [COSMIC GOLD THEME UNLOCKED]", type: "success" });
      setFlagInput("");
      if (onThemeChange) onThemeChange("gold");
    } else {
      setCtfFeedback({ text: "INTEGRITY FAULT: DECRYPTION TOKEN UNRECOGNIZED", type: "error" });
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 border border-[#00FF41]/10 bg-black/60 p-4 rounded-[3px] font-mono text-xs shadow-lg relative overflow-hidden">
      {/* Decorative corner brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00FF41]/30" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00FF41]/30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00FF41]/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00FF41]/30" />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#00FF41]/15 pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00FF41] animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">RED TEAM DECRYPTION CENTER</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("decoder")}
            className={`px-2.5 py-1 text-[9px] uppercase tracking-wider rounded-[1px] transition-all duration-300 ${
              activeTab === "decoder"
                ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            DEC_UTILITY
          </button>
          <button
            onClick={() => setActiveTab("ctf")}
            className={`px-2.5 py-1 text-[9px] uppercase tracking-wider rounded-[1px] transition-all duration-300 relative ${
              activeTab === "ctf"
                ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            FLAG_SUBMIT
            {Object.values(solvedFlags).some(v => v) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#00FF41] rounded-full animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("hints")}
            className={`px-2.5 py-1 text-[9px] uppercase tracking-wider rounded-[1px] transition-all duration-300 ${
              activeTab === "hints"
                ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30"
                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            INTEL_HINTS
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === "decoder" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-[#00FF41]/10 pb-2">
            <span className="text-[9px] text-[#00E5FF] uppercase">ALGORITHM ENGINE:</span>
            <div className="flex flex-wrap gap-1">
              {(["rot13", "base64", "hex", "binary", "reverse"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setAlgo(item)}
                  className={`px-1.5 py-0.5 text-[8.5px] rounded-[1px] uppercase border transition-all ${
                    algo === item
                      ? "border-[#00FF41] text-[#00FF41] bg-[#00FF41]/5"
                      : "border-transparent text-white/50 hover:text-white/80"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Input cipher */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-white/60 flex items-center gap-1.5 uppercase">
                <Lock className="w-3 h-3 text-[#00E5FF]" /> INPUT_CYPHER
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste encrypted stream or standard text here..."
                className="w-full h-24 bg-black/40 border border-[#00FF41]/15 rounded p-2 text-[10.5px] outline-none text-white focus:border-[#00FF41]/40 transition-colors placeholder-[#00FF41]/30 resize-none cyber-scrollbar"
              />
            </div>

            {/* Output decrypted */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-white/60 flex items-center gap-1.5 uppercase">
                <Unlock className="w-3 h-3 text-[#00FF41]" /> DECRYPTED_READOUT
              </label>
              <div className="w-full h-24 bg-black/80 border border-[#00FF41]/15 rounded p-2 text-[10.5px] font-mono text-[#00FF41] relative select-all overflow-y-auto cyber-scrollbar">
                {isGlitching ? (
                  <span className="text-[#00E5FF]/80 animate-pulse">
                    &gt;&gt; EXTRACTING DECRYPTION COEFFICIENTS...
                  </span>
                ) : outputText ? (
                  outputText
                ) : (
                  <span className="text-white/20 italic">Decrypted text will output here...</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => handleTranslate("encode")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00FF41]/5 hover:bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41] uppercase text-[9px] tracking-wider rounded-[2px] transition-all"
            >
              <Lock className="w-3 h-3" /> Encode cipher
            </button>
            <button
              onClick={() => handleTranslate("decode")}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00FF41] hover:bg-white text-black font-bold uppercase text-[9px] tracking-wider rounded-[2px] transition-all"
            >
              <Unlock className="w-3 h-3" /> Decrypt Stream
            </button>
          </div>
        </div>
      )}

      {activeTab === "ctf" && (
        <div className="flex flex-col gap-3">
          <p className="text-[9.5px] text-[#00FF41]/85 leading-relaxed bg-[#00FF41]/5 p-2 border border-[#00FF41]/15 rounded-[2px]">
            <Shield className="w-3.5 h-3.5 inline mr-1.5 align-text-bottom text-[#00FF41]" />
            Submit CTF flags found throughout the security network topology, command console history, or secret specs. Correct submissions will unlock permanent server-override themes (Crimson, Cyan, or Cosmic Gold)!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-1">
            {/* Net flag */}
            <div className={`p-2.5 border rounded-[2px] flex flex-col justify-between ${
              solvedFlags.net 
                ? "border-[#00FF41]/30 bg-[#00FF41]/5" 
                : "border-white/10 bg-black/20"
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${solvedFlags.net ? "bg-[#00FF41]" : "bg-white/20 animate-pulse"}`} />
                <span className="font-bold text-[10px] text-white">SUB_NETWORK INTEL</span>
              </div>
              <span className="text-[8px] font-mono text-[#00E5FF] uppercase mb-2">Flag 1</span>
              <span className="text-[9px] font-mono break-all text-white/70">
                {solvedFlags.net ? "Decrypted: KRA{N3T_W0RK_DEC0D3D}" : "RECON PENDING..."}
              </span>
            </div>

            {/* Terminal flag */}
            <div className={`p-2.5 border rounded-[2px] flex flex-col justify-between ${
              solvedFlags.terminal 
                ? "border-[#00FF41]/30 bg-[#00FF41]/5" 
                : "border-white/10 bg-black/20"
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${solvedFlags.terminal ? "bg-[#00FF41]" : "bg-white/20 animate-pulse"}`} />
                <span className="font-bold text-[10px] text-white">CLI SANDBOX MASTER</span>
              </div>
              <span className="text-[8px] font-mono text-[#00E5FF] uppercase mb-2">Flag 2</span>
              <span className="text-[9px] font-mono break-all text-white/70">
                {solvedFlags.terminal ? "Decrypted: KRA{T3RM1NAL_M4ST3R}" : "EXPLOIT PENDING..."}
              </span>
            </div>

            {/* Command palette flag */}
            <div className={`p-2.5 border rounded-[2px] flex flex-col justify-between ${
              solvedFlags.command 
                ? "border-[#00FF41]/30 bg-[#00FF41]/5" 
                : "border-white/10 bg-black/20"
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${solvedFlags.command ? "bg-[#00FF41]" : "bg-white/20 animate-pulse"}`} />
                <span className="font-bold text-[10px] text-white">OVERRIDE MAINFRAME</span>
              </div>
              <span className="text-[8px] font-mono text-[#00E5FF] uppercase mb-2">Flag 3</span>
              <span className="text-[9px] font-mono break-all text-white/70">
                {solvedFlags.command ? "Decrypted: KRA{COMM4ND_ACCE$$}" : "OVERRIDE PENDING..."}
              </span>
            </div>
          </div>

          <form onSubmit={handleFlagSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00FF41]/50" />
              <input
                type="text"
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                placeholder="Enter decrypted flag hash (e.g., KRA{...})"
                className="w-full bg-black/50 border border-[#00FF41]/20 rounded px-2.5 py-2 pl-8 outline-none text-[#00FF41] placeholder-[#00FF41]/30 focus:border-[#00FF41]/50 text-[10.5px] tracking-wider uppercase font-mono"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            <button
              type="submit"
              className="bg-[#00FF41] hover:bg-white text-black font-bold uppercase text-[9.5px] px-4 rounded-[2px] transition-all tracking-wider shrink-0"
            >
              AUTHENTICATE
            </button>
          </form>

          <div className={`text-[8.5px] font-mono uppercase p-1.5 border tracking-wider text-center ${
            ctfFeedback.type === "success" 
              ? "border-[#00FF41]/30 text-[#00FF41] bg-[#00FF41]/5" 
              : ctfFeedback.type === "error" 
              ? "border-red-500/30 text-red-400 bg-red-950/20" 
              : "border-white/10 text-white/50"
          }`}>
            Status: {ctfFeedback.text}
          </div>
        </div>
      )}

      {activeTab === "hints" && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-[#00E5FF] border-b border-[#00E5FF]/10 pb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="font-bold text-[9.5px] uppercase tracking-wider">INTEL RECONNAISSANCE LOGS</span>
          </div>

          <div className="space-y-2">
            <div className="p-2 border border-dashed border-[#00FF41]/15 bg-black/30 rounded-[2px]">
              <span className="text-[9px] text-[#00FF41] font-bold uppercase block mb-0.5">NET_TOPOLOGY FLAG [1]</span>
              <p className="text-[9.5px] text-white/80 leading-relaxed font-sans">
                A cyber team leaked details of tactical systems on the <strong className="text-[#00E5FF]">Slide 4 (Operations)</strong>. Switch to the topology map view (<code className="font-mono px-1 py-0.5 bg-black/60 text-[#00FF41] rounded border border-[#00FF41]/10 text-[8.5px]">NET_TOPOLOGY</code>), inspect or hover on the defensive security category node or custom scanner tools.
              </p>
            </div>

            <div className="p-2 border border-dashed border-[#00FF41]/15 bg-black/30 rounded-[2px]">
              <span className="text-[9px] text-[#00FF41] font-bold uppercase block mb-0.5">CLI_SANDBOX FLAG [2]</span>
              <p className="text-[9.5px] text-white/80 leading-relaxed font-sans">
                The terminal shell on <strong className="text-[#00E5FF]">Slide 3 (Skills)</strong> connects directly to a secure sandbox session. There is a hidden system environment command that lists secure configuration details. Open the command terminal and type: <code className="font-mono px-1 py-0.5 bg-black/60 text-[#00FF41] rounded border border-[#00FF41]/10 text-[8.5px]">secret</code>.
              </p>
            </div>

            <div className="p-2 border border-dashed border-[#00FF41]/15 bg-black/30 rounded-[2px]">
              <span className="text-[9px] text-[#00FF41] font-bold uppercase block mb-0.5">SYSTEM_OVERRIDE FLAG [3]</span>
              <p className="text-[9.5px] text-white/80 leading-relaxed font-sans">
                To extract the third flag, use the decoder itself! Try decoding the following cipher stream using the ROT13 algorithm option: <code className="font-mono px-1.5 py-0.5 bg-black/60 text-[#00FF41] rounded border border-[#00FF41]/10 text-[9px] tracking-wider select-all">{"XEN{PBZZ4AQ_NPPR$$}"}</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
