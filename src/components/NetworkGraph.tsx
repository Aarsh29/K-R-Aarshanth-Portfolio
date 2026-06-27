import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ProjectItem } from "../types";
import { projects } from "../data";
import { Github, ExternalLink, Info, Activity } from "lucide-react";

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "core" | "category" | "project";
  description?: string;
  backDesc?: string;
  tags?: string[];
  icon?: string;
  githubUrl?: string;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
}

export default function NetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [isAutoScanActive, setIsAutoScanActive] = useState(true);
  const [autoScanNode, setAutoScanNode] = useState<NetworkNode | null>(null);

  // Initialize nodes and links
  const categories = [
    { id: "cat-sec", label: "Defensive Security", type: "category" as const },
    { id: "cat-off", label: "Offensive Recon", type: "category" as const },
    { id: "cat-app", label: "Web Applications", type: "category" as const },
  ];

  const graphNodes: NetworkNode[] = [
    { id: "core-system", label: "CORESYSTEM (K R Aarshanth)", type: "core" },
    ...categories,
    ...projects.map((proj, idx) => {
      // Map project to category
      let categoryId = "cat-app";
      if (proj.name.includes("Phishing") || proj.name.includes("Login")) {
        categoryId = "cat-sec";
      } else if (proj.name.includes("Scanner") || proj.name.includes("Strength")) {
        categoryId = "cat-off";
      }

      return {
        id: `proj-${idx}`,
        label: proj.name,
        type: "project" as const,
        description: proj.desc,
        backDesc: proj.backDesc,
        tags: proj.tags,
        icon: proj.icon,
        githubUrl: proj.githubUrl,
        categoryId, // Custom field for reference
      };
    }),
  ];

  const graphLinks: NetworkLink[] = [
    // Connect Core to Categories
    { source: "core-system", target: "cat-sec" },
    { source: "core-system", target: "cat-off" },
    { source: "core-system", target: "cat-app" },
    // Connect Projects to Categories
    ...graphNodes
      .filter((n) => n.type === "project")
      .map((n: any) => ({
        source: n.categoryId,
        target: n.id,
      })),
  ];

  // Candidates for Auto-Scan sequence (excluding core system)
  const scanCandidates = graphNodes.filter((n) => n.id !== "core-system");

  // Auto-Scan Interval Loop
  useEffect(() => {
    if (!isAutoScanActive) {
      setAutoScanNode(null);
      return;
    }

    const runScan = () => {
      if (scanCandidates.length === 0) return;
      const randomIndex = Math.floor(Math.random() * scanCandidates.length);
      const selected = scanCandidates[randomIndex];
      setAutoScanNode(selected);
    };

    // Run first scan immediately
    runScan();

    const interval = setInterval(runScan, 3000);
    return () => clearInterval(interval);
  }, [isAutoScanActive]);

  // Main D3 force simulation setup
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 450;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Create a group container for zoom/pan
    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Click on empty SVG space clears locked/selected node
    svg.on("click", function (event) {
      if (event.target === svgRef.current) {
        setSelectedNode(null);
      }
    });

    // Center the simulation
    const simulation = d3.forceSimulation<NetworkNode>(graphNodes)
      .force("link", d3.forceLink<NetworkNode, NetworkLink>(graphLinks)
        .id((d) => d.id)
        .distance((d: any) => {
          if (d.source.type === "core" || d.target.type === "core") return 90;
          return 65;
        })
      )
      .force("charge", d3.forceManyBody().strength(-240))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Glow Filter Definition
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "neon-glow-filter");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3.5")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Render links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graphLinks)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => {
        if (d.source.id === "core-system" || d.target.id === "core-system") return "rgba(0, 229, 255, 0.4)";
        return "rgba(0, 255, 65, 0.22)";
      })
      .attr("stroke-width", (d: any) => {
        if (d.source.id === "core-system" || d.target.id === "core-system") return 1.8;
        return 1.2;
      })
      .attr("stroke-dasharray", (d: any) => {
        if (d.source.type === "category" || d.target.type === "category") return "2,2";
        return "none";
      });

    // Render node groups
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(graphNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "crosshair")
      .call(drag(simulation) as any);

    // Node Circle Styles
    node.append("circle")
      .attr("r", (d) => {
        if (d.type === "core") return 14;
        if (d.type === "category") return 9;
        return 6;
      })
      .attr("fill", (d) => {
        if (d.type === "core") return "#00E5FF";
        if (d.type === "category") return "#050505";
        return "#00FF41";
      })
      .attr("stroke", (d) => {
        if (d.type === "core") return "rgba(0, 229, 255, 0.8)";
        if (d.type === "category") return "#00E5FF";
        return "rgba(0, 255, 65, 0.5)";
      })
      .attr("stroke-width", (d) => (d.type === "core" ? 3 : 1.5))
      .style("filter", (d) => (d.type === "core" ? "url(#neon-glow-filter)" : "none"));

    // Outer pulsed ring for Core node
    node.filter((d) => d.type === "core")
      .append("circle")
      .attr("r", 22)
      .attr("fill", "none")
      .attr("stroke", "rgba(0, 229, 255, 0.2)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .style("animation", "spin 12s linear infinite");

    // Node Labels
    node.append("text")
      .attr("dy", (d) => (d.type === "core" ? "-18" : d.type === "category" ? "-14" : "15"))
      .attr("text-anchor", "middle")
      .text((d) => d.label)
      .attr("fill", (d) => {
        if (d.type === "core") return "#FFFFFF";
        if (d.type === "category") return "#00E5FF";
        return "rgba(0, 255, 65, 0.85)";
      })
      .style("font-family", "'JetBrains Mono', monospace")
      .style("font-size", (d) => (d.type === "core" ? "9px" : d.type === "category" ? "8.5px" : "8px"))
      .style("font-weight", (d) => (d.type === "project" ? "normal" : "bold"))
      .style("pointer-events", "none")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.5px");

    // Interactivity simply relays events to state
    node.on("mouseover", function (event, d) {
      setHoveredNode(d);
    });

    node.on("mouseout", function () {
      setHoveredNode(null);
    });

    node.on("click", function (event, d) {
      setSelectedNode(d);
    });

    // Update coordinates on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
    });

    // Handle drag interaction
    function drag(sim: d3.Simulation<NetworkNode, undefined>) {
      return d3.drag<SVGGElement, NetworkNode>()
        .on("start", (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }

    // Handle window resize dynamically
    const handleResize = () => {
      if (!containerRef.current || !svgRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      svg.attr("width", w).attr("height", h);
      simulation.force("center", d3.forceCenter(w / 2, h / 2)).alpha(0.3).restart();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      simulation.stop();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle reactive styling updates based on hoveredNode or autoScanNode
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const nodesG = svg.selectAll(".node");
    const lines = svg.selectAll("line");

    const activeNode = hoveredNode || (isAutoScanActive ? autoScanNode : null);

    if (activeNode) {
      // Highlight connections for activeNode
      lines.attr("stroke", (l: any) => {
        const sId = typeof l.source === "object" ? l.source.id : l.source;
        const tId = typeof l.target === "object" ? l.target.id : l.target;
        if (sId === activeNode.id || tId === activeNode.id) {
          return activeNode.type === "category" ? "#00E5FF" : "#00FF41";
        }
        return "rgba(0, 255, 65, 0.05)";
      }).attr("stroke-width", (l: any) => {
        const sId = typeof l.source === "object" ? l.source.id : l.source;
        const tId = typeof l.target === "object" ? l.target.id : l.target;
        if (sId === activeNode.id || tId === activeNode.id) return 2.2;
        return 0.5;
      });

      // Highlight nodes
      nodesG.selectAll("circle")
        .attr("opacity", (n: any) => {
          if (n.id === activeNode.id) return 1;
          const isConnected = graphLinks.some(
            (l: any) => {
              const sId = typeof l.source === "object" ? l.source.id : l.source;
              const tId = typeof l.target === "object" ? l.target.id : l.target;
              return (sId === activeNode.id && tId === n.id) || (tId === activeNode.id && sId === n.id);
            }
          );
          return isConnected ? 1 : 0.25;
        })
        .attr("stroke", (n: any) => {
          if (n.id === activeNode.id) {
            return activeNode.type === "category" ? "#00E5FF" : "#00FF41";
          }
          if (n.type === "core") return "rgba(0, 229, 255, 0.8)";
          if (n.type === "category") return "#00E5FF";
          return "rgba(0, 255, 65, 0.5)";
        })
        .attr("stroke-width", (n: any) => {
          if (n.id === activeNode.id) return 4;
          return n.type === "core" ? 3 : 1.5;
        })
        .style("filter", (n: any) => {
          if (n.id === activeNode.id) return "url(#neon-glow-filter)";
          return n.type === "core" ? "url(#neon-glow-filter)" : "none";
        });
    } else {
      // Reset to defaults
      lines.attr("stroke", (l: any) => {
        const sId = typeof l.source === "object" ? l.source.id : l.source;
        const tId = typeof l.target === "object" ? l.target.id : l.target;
        if (sId === "core-system" || tId === "core-system") return "rgba(0, 229, 255, 0.4)";
        return "rgba(0, 255, 65, 0.22)";
      })
      .attr("stroke-width", (l: any) => {
        const sId = typeof l.source === "object" ? l.source.id : l.source;
        const tId = typeof l.target === "object" ? l.target.id : l.target;
        if (sId === "core-system" || tId === "core-system") return 1.8;
        return 1.2;
      });

      nodesG.selectAll("circle")
        .attr("opacity", 1)
        .attr("stroke", (n: any) => {
          if (n.type === "core") return "rgba(0, 229, 255, 0.8)";
          if (n.type === "category") return "#00E5FF";
          return "rgba(0, 255, 65, 0.5)";
        })
        .attr("stroke-width", (n: any) => (n.type === "core" ? 3 : 1.5))
        .style("filter", (n: any) => (n.type === "core" ? "url(#neon-glow-filter)" : "none"));
    }
  }, [hoveredNode, autoScanNode, isAutoScanActive]);

  // Priority Stack: Hovered node > Selected/Locked node > Auto-scanned node
  const activeDetailNode = hoveredNode || selectedNode || (isAutoScanActive ? autoScanNode : null);

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 h-[calc(100vh-260px)] min-h-[360px] relative">
      {/* Network Graph Stage */}
      <div 
        ref={containerRef} 
        className="flex-1 relative border border-[#00FF41]/10 bg-black/40 rounded-[3px] overflow-hidden"
      >
        {/* Tactical Control Bar */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-3 bg-black/80 border border-[#00FF41]/20 px-3 py-1.5 rounded-[2px] font-mono select-none">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAutoScanActive ? "bg-[#00FF41] animate-pulse" : "bg-red-500"}`} />
            <span className="text-[9px] text-[#00FF41] tracking-widest uppercase font-bold">
              {isAutoScanActive ? "AUTOSCAN: ACTIVE" : "AUTOSCAN: STANDBY"}
            </span>
          </div>
          <div className="h-3 w-[1px] bg-[#00FF41]/20" />
          <button
            onClick={() => setIsAutoScanActive(!isAutoScanActive)}
            className={`text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-[1px] border transition-all duration-150 cursor-pointer ${
              isAutoScanActive
                ? "bg-[#00FF41]/10 border-[#00FF41]/50 text-[#00FF41] hover:bg-[#00FF41]/20"
                : "bg-red-950/20 border-red-500/40 text-red-400 hover:bg-red-500/10"
            }`}
          >
            {isAutoScanActive ? "HALT" : "INITIATE"}
          </button>
        </div>

        {/* Active Scan Telemetry Overlay */}
        {isAutoScanActive && autoScanNode && (
          <div className="absolute top-3 right-3 z-20 hidden sm:flex flex-col items-end gap-0.5 bg-black/80 border border-[#00FF41]/10 px-2.5 py-1.5 rounded-[1px] font-mono text-[7.5px] text-[#00FF41]/70">
            <div>TARGET NODE: <span className="text-white">{autoScanNode.label}</span></div>
            <div>STATUS: <span className="text-[#00E5FF] animate-pulse">DECRYPTING PACKETS...</span></div>
          </div>
        )}

        {/* Decorative Grid Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        <svg 
          ref={svgRef} 
          className="relative z-10 w-full h-full block"
        />

        {/* Dynamic Scan Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00FF41]/10 pointer-events-none animate-[scan_6s_linear_infinite]" />

        {/* Mini HUD Controls Helper */}
        <div className="absolute bottom-2 left-3 z-20 font-mono text-[8px] text-[#00E5FF]/70 uppercase tracking-widest pointer-events-none select-none">
          SYSTEM: ZOOM [SCROLL] · DRAG [ACTIVE] · HOVER [DECRYPT] · CLICK [LOCK]
        </div>
      </div>

      {/* Slide-out or Static Decrypted Panel */}
      <div className="w-full md:w-[240px] border border-[#00FF41]/15 bg-black/70 p-4 rounded-[2px] flex flex-col justify-between cyber-panel h-full overflow-y-auto cyber-scrollbar">
        {activeDetailNode && activeDetailNode.type === "project" ? (
          <div className="flex flex-col h-full justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2 border-b border-[#00FF41]/15 pb-2">
                <span className="text-xl shrink-0">{activeDetailNode.icon || "🛡️"}</span>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">{activeDetailNode.label}</h4>
                  <span className="font-mono text-[8px] text-[#00E5FF] uppercase font-semibold">
                    {selectedNode?.id === activeDetailNode.id ? "🔒 LOCKED NODE" : "Decrypted Node"}
                  </span>
                </div>
              </div>

              {selectedNode?.id === activeDetailNode.id && (
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-full mb-3 font-mono text-[7.5px] text-[#00E5FF] hover:text-white border border-[#00E5FF]/30 hover:border-[#00E5FF]/80 px-2 py-1 rounded-[1px] bg-[#00E5FF]/5 transition-all duration-150 uppercase tracking-widest cursor-pointer"
                >
                  [ Release Node Lock ]
                </button>
              )}

              <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#00FF41] mb-3 bg-[#00FF41]/5 px-2 py-1 border border-[#00FF41]/15 rounded-[1px]">
                <Activity className="w-3 h-3 text-[#00FF41] animate-pulse" />
                <span>INTEGRITY SECURE</span>
              </div>

              <p className="text-[10px] text-[#00FF41]/85 font-mono leading-relaxed mb-3">
                {activeDetailNode.description}
              </p>

              {activeDetailNode.backDesc && (
                <div className="border border-dashed border-[#00E5FF]/20 p-2 rounded-[2px] bg-[#00E5FF]/3 mb-3">
                  <div className="font-mono text-[7.5px] text-[#00E5FF] font-bold uppercase mb-1 flex items-center gap-1">
                    <Info className="w-2.5 h-2.5" />
                    <span>Technical Spec Sheet</span>
                  </div>
                  <p className="text-[9.5px] text-white/90 leading-relaxed font-sans italic">
                    {activeDetailNode.backDesc}
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap gap-1 mb-4">
                {activeDetailNode.tags?.map((tag, idx) => (
                  <span key={idx} className="text-[8px] font-mono bg-[#00FF41]/5 border border-[#00FF41]/15 text-[#00FF41] px-1.5 py-0.5 rounded-[1px]">
                    {tag}
                  </span>
                ))}
              </div>

              {activeDetailNode.githubUrl && (
                <a
                  href={activeDetailNode.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 font-mono text-[10px] tracking-wider uppercase text-black bg-[#00FF41] hover:bg-white px-3 py-2 rounded-[2px] font-bold transition-all duration-300"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Access Repo</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}
            </div>
          </div>
        ) : activeDetailNode && activeDetailNode.type === "category" ? (
          <div className="flex flex-col h-full justify-start gap-3">
            <div className="flex items-center gap-2 mb-2 border-b border-[#00FF41]/15 pb-2">
              <span className="text-lg text-[#00E5FF]">📂</span>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">{activeDetailNode.label}</h4>
                <span className="font-mono text-[8px] text-[#00E5FF] uppercase font-semibold">
                  {selectedNode?.id === activeDetailNode.id ? "🔒 LOCKED NODE" : "Sub-Network Hub"}
                </span>
              </div>
            </div>

            {selectedNode?.id === activeDetailNode.id && (
              <button
                onClick={() => setSelectedNode(null)}
                className="w-full mb-3 font-mono text-[7.5px] text-[#00E5FF] hover:text-white border border-[#00E5FF]/30 hover:border-[#00E5FF]/80 px-2 py-1 rounded-[1px] bg-[#00E5FF]/5 transition-all duration-150 uppercase tracking-widest cursor-pointer"
              >
                [ Release Node Lock ]
              </button>
            )}

            <p className="text-[10px] text-[#00FF41]/85 font-mono leading-relaxed mb-2">
              Contains tactical systems, security configurations, and operational repositories. Hover over children nodes connected to this hub to extract system records.
            </p>

            {activeDetailNode.id === "cat-sec" && (
              <div className="border border-dashed border-[#00E5FF]/20 bg-[#00E5FF]/5 p-2 rounded-[2px] mt-1">
                <div className="font-mono text-[8px] text-[#00E5FF] font-bold uppercase mb-0.5">INTERCEPTED HASH:</div>
                <div className="font-mono text-[9px] text-[#00FF41] font-bold select-all tracking-wider">{"KRA{N3T_W0RK_DEC0D3D}"}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center gap-2 select-none opacity-60">
            <div className="w-9 h-9 rounded-full border border-dashed border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] animate-spin-slow">
              ⌬
            </div>
            <div className="font-mono text-[9px] text-[#00FF41] tracking-widest uppercase">
              RECON PENDING
            </div>
            <p className="text-[8.5px] text-[#00FF41]/70 font-mono max-w-[170px] leading-relaxed">
              Hover over network nodes in the topology map to intercept telemetry and decrypt operational descriptions.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
