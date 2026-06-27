export interface PowerLogEvent {
  id: string;
  timestamp: string;
  previousLevel: number;
  currentLevel: number;
  drainPercent: number;
  reason: string;
  subsystem: "KERNEL" | "UI_ENGINE" | "GRAPH_SIM" | "AUDIO_COPROC" | "CIPHER_CORE";
}

class PowerSystem {
  private listeners = new Set<() => void>();
  private maxLogs = 50;

  constructor() {
    // Seed initial power logs if none exist to make the interface look realistic immediately
    const existing = this.getLogs();
    if (existing.length === 0) {
      this.seedInitialLogs();
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error("Error in power system listener:", e);
      }
    });
  }

  getLogs(): PowerLogEvent[] {
    try {
      const logsRaw = localStorage.getItem("kra_power_logs");
      if (logsRaw) {
        return JSON.parse(logsRaw);
      }
    } catch (e) {
      console.error("Failed to read power logs:", e);
    }
    return [];
  }

  addLog(previousLevel: number, currentLevel: number, reason: string, subsystem: PowerLogEvent["subsystem"]) {
    const drainPercent = previousLevel - currentLevel;
    if (drainPercent <= 0) return;

    const newLog: PowerLogEvent = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
      previousLevel,
      currentLevel,
      drainPercent,
      reason,
      subsystem
    };

    try {
      const currentLogs = this.getLogs();
      const updatedLogs = [newLog, ...currentLogs].slice(0, this.maxLogs);
      localStorage.setItem("kra_power_logs", JSON.stringify(updatedLogs));
      this.notify();
    } catch (e) {
      console.error("Failed to add power log:", e);
    }
  }

  private seedInitialLogs() {
    const now = new Date();
    const initialEvents: PowerLogEvent[] = [
      {
        id: "PWR-B74A",
        timestamp: new Date(now.getTime() - 1000 * 60 * 32).toISOString(), // 32m ago
        previousLevel: 100,
        currentLevel: 99,
        drainPercent: 1,
        reason: "Initial Secure Boot Sequence and RAM encryption audit",
        subsystem: "KERNEL"
      },
      {
        id: "PWR-E19C",
        timestamp: new Date(now.getTime() - 1000 * 60 * 25).toISOString(), // 25m ago
        previousLevel: 99,
        currentLevel: 97,
        drainPercent: 2,
        reason: "High-density D3 Network topology map compilation",
        subsystem: "GRAPH_SIM"
      },
      {
        id: "PWR-A04F",
        timestamp: new Date(now.getTime() - 1000 * 60 * 18).toISOString(), // 18m ago
        previousLevel: 97,
        currentLevel: 96,
        drainPercent: 1,
        reason: "Active soundcard initialization and low-freq machine hum start",
        subsystem: "AUDIO_COPROC"
      },
      {
        id: "PWR-F88B",
        timestamp: new Date(now.getTime() - 1000 * 60 * 12).toISOString(), // 12m ago
        previousLevel: 96,
        currentLevel: 93,
        drainPercent: 3,
        reason: "Intrusion system background sandbox decryption check",
        subsystem: "CIPHER_CORE"
      },
      {
        id: "PWR-D42E",
        timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString(), // 5m ago
        previousLevel: 93,
        currentLevel: 91,
        drainPercent: 2,
        reason: "Rapid client-side navigation and slide layout rendering",
        subsystem: "UI_ENGINE"
      }
    ];

    try {
      localStorage.setItem("kra_power_logs", JSON.stringify(initialEvents));
    } catch (e) {}
  }
}

export const powerSystem = new PowerSystem();
