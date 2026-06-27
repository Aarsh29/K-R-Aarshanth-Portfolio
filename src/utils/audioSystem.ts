class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private humGain: GainNode | null = null; // Used as the main BGM volume controller
  
  private isMasterActive = false;
  private isHumActive = true;
  private isPingsActive = true;
  
  private humVolume = 0.12;
  private pingVolume = 0.06;
  
  private pingIntervalId: any = null;
  private sequencerIntervalId: any = null;
  private stepIndex = 0;
  private bgmPreset: "mr_robot" | "tron" | "social_network" = "social_network";
  private listeners = new Set<() => void>();

  constructor() {
    try {
      const master = localStorage.getItem("kra_audio_master");
      const hum = localStorage.getItem("kra_audio_hum");
      const pings = localStorage.getItem("kra_audio_pings");
      const humVol = localStorage.getItem("kra_audio_hum_vol");
      const pingVol = localStorage.getItem("kra_audio_ping_vol");
      const preset = localStorage.getItem("kra_audio_bgm_preset");

      if (master !== null) this.isMasterActive = master === "true";
      if (hum !== null) this.isHumActive = hum === "true";
      if (pings !== null) this.isPingsActive = pings === "true";
      if (humVol !== null) this.humVolume = parseFloat(humVol);
      if (pingVol !== null) this.pingVolume = parseFloat(pingVol);
      if (preset !== null && (preset === "mr_robot" || preset === "tron" || preset === "social_network")) {
        this.bgmPreset = preset as any;
      }
    } catch (e) {
      console.warn("Storage access not available:", e);
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
        console.error("Error in audio system listener:", e);
      }
    });
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMasterActive ? 1.0 : 0.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    
    this.startHum();
    this.startPings();
  }

  private startHum() {
    if (!this.ctx || !this.masterGain) return;
    try {
      this.stopHum();
      
      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(this.isHumActive ? this.humVolume : 0.0, this.ctx.currentTime);
      this.humGain.connect(this.masterGain);
      
      this.startSequencer();
    } catch (e) {
      console.error("Failed to start BGM sequencer master node:", e);
    }
  }

  private stopHum() {
    this.stopSequencer();
    this.humGain = null;
  }

  private startSequencer() {
    this.stopSequencer();
    this.stepIndex = 0;
    
    // Set ticking speed based on the preset's feeling
    const intervalMs = this.bgmPreset === "tron" ? 140 : this.bgmPreset === "mr_robot" ? 175 : 280;
    
    this.sequencerIntervalId = setInterval(() => {
      this.playSequencerStep();
    }, intervalMs);
  }

  private stopSequencer() {
    if (this.sequencerIntervalId) {
      clearInterval(this.sequencerIntervalId);
      this.sequencerIntervalId = null;
    }
  }

  private playSequencerStep() {
    if (!this.ctx || !this.humGain || !this.isMasterActive || !this.isHumActive) return;
    if (this.ctx.state === "suspended") return;
    
    const now = this.ctx.currentTime;
    const step = this.stepIndex;
    this.stepIndex = (this.stepIndex + 1) % 16;
    
    if (this.bgmPreset === "mr_robot") {
      this.playMrRobotStep(step, now);
    } else if (this.bgmPreset === "tron") {
      this.playTronStep(step, now);
    } else {
      this.playSocialNetworkStep(step, now);
    }
  }

  // --- MR. ROBOT SYNTHESIZERS ---
  private playMrRobotStep(step: number, now: number) {
    // 100 BPM feeling. Industrial, suspenseful, minor key
    // Bass note rhythm on steps: 0, 3, 6, 8, 11, 14
    const bassScale = [
      55.00,  // A1
      55.00,  // A1
      65.41,  // C2
      65.41,  // C2
      73.42,  // D2
      73.42,  // D2
      48.99,  // G1
      48.99   // G1
    ];
    
    if ([0, 3, 6, 8, 11, 14].includes(step)) {
      const idx = Math.floor(step / 2) % bassScale.length;
      this.triggerBassSynth(bassScale[idx], now, 0.4, "triangle", 110);
    }
    
    // Lead echo notes on steps 4, 10, 12
    if (step === 4) this.triggerLeadSynth(440.00, now, 0.6, "sine"); // A4
    if (step === 10) this.triggerLeadSynth(523.25, now, 0.6, "sine"); // C5
    if (step === 12) this.triggerLeadSynth(587.33, now, 0.8, "sine"); // D5
  }

  // --- TRON: LEGACY SYNTHESIZERS ---
  private playTronStep(step: number, now: number) {
    // 120 BPM driving synthwave. High energy
    // Driving continuous 1/8th bass notes
    const bassScale = [
      73.42,  // D2
      73.42,  // D2
      87.31,  // F2
      87.31,  // F2
      65.41,  // C2
      65.41,  // C2
      98.00,  // G2
      98.00   // G2
    ];
    
    if (step % 2 === 0) {
      const idx = Math.floor(step / 2) % bassScale.length;
      this.triggerBassSynth(bassScale[idx], now, 0.22, "sawtooth", 140);
    }
    
    // Rapid cascading melodic arpeggio (16th notes feel)
    const arpScale = [
      293.66, // D4
      349.23, // F4
      440.00, // A4
      587.33, // D5
      523.25, // C5
      440.00, // A4
      349.23, // F4
      440.00, // A4
      349.23, // F4
      440.00, // A4
      523.25, // C5
      698.46, // F5
      659.25, // E5
      523.25, // C5
      440.00, // A4
      523.25  // C5
    ];
    
    this.triggerLeadSynth(arpScale[step], now, 0.15, "triangle", 0.18, 500);
  }

  // --- THE SOCIAL NETWORK SYNTHESIZERS ---
  private playSocialNetworkStep(step: number, now: number) {
    // Trent Reznor Style: Warm, soft, melancholic ambient felt-piano
    // Long swelling chord pad on step 0 and 8
    if (step === 0) {
      // Am9 pad: A2 (110Hz), E3 (164.81Hz), B3 (246.94Hz), C4 (261.63Hz)
      this.triggerPadChord([110.00, 164.81, 246.94, 261.63], now, 2.5);
    } else if (step === 8) {
      // Fmaj9 pad: F2 (87.31Hz), C3 (130.81Hz), G3 (196.00Hz), A3 (220.00Hz)
      this.triggerPadChord([87.31, 130.81, 196.00, 220.00], now, 2.5);
    }
    
    // Felt-piano echo keys (sparse and beautiful)
    if (step === 2) this.triggerPianoSynth(659.25, now, 0.45); // E5
    if (step === 5) this.triggerPianoSynth(987.77, now, 0.45); // B5
    if (step === 10) this.triggerPianoSynth(1046.50, now, 0.45); // C6
    if (step === 13) this.triggerPianoSynth(880.00, now, 0.55); // A5
  }

  // --- REUSABLE SYNTH GENERATORS ---
  private triggerBassSynth(freq: number, startTime: number, volume: number, type: OscillatorType, filterFreq = 100) {
    if (!this.ctx || !this.humGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(filterFreq, startTime);
      filter.frequency.exponentialRampToValueAtTime(filterFreq * 0.6, startTime + 0.3);
      filter.Q.setValueAtTime(1.0, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.humGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    } catch (e) {}
  }

  private triggerLeadSynth(freq: number, startTime: number, volume: number, type: OscillatorType, decay = 0.4, cutoff = 1500) {
    if (!this.ctx || !this.humGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoff, startTime);
      filter.frequency.exponentialRampToValueAtTime(cutoff * 0.4, startTime + decay);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.humGain);
      
      osc.start(startTime);
      osc.stop(startTime + decay + 0.1);
    } catch (e) {}
  }

  private triggerPianoSynth(freq: number, startTime: number, volume: number) {
    if (!this.ctx || !this.humGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      
      osc.type = "triangle"; // Nice soft felt tone
      osc.frequency.setValueAtTime(freq, startTime);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 1.5, startTime);
      filter.frequency.exponentialRampToValueAtTime(freq * 0.7, startTime + 1.2);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.5);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.humGain);
      
      osc.start(startTime);
      osc.stop(startTime + 1.6);
    } catch (e) {}
  }

  private triggerPadChord(freqs: number[], startTime: number, duration: number) {
    if (!this.ctx || !this.humGain) return;
    try {
      const chordVolume = 0.18 / freqs.length;
      freqs.forEach((freq) => {
        if (!this.ctx || !this.humGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(freq * 1.8, startTime);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + duration);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(chordVolume, startTime + 0.8); // Slow beautiful swell
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.humGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration + 0.2);
      });
    } catch (e) {}
  }

  private startPings() {
    this.stopPings();
    
    const triggerPing = () => {
      if (!this.ctx || !this.masterGain || !this.isPingsActive || !this.isMasterActive) return;
      if (this.ctx.state === "suspended") return;
      
      try {
        const now = this.ctx.currentTime;
        const pingOsc = this.ctx.createOscillator();
        const pingFilter = this.ctx.createBiquadFilter();
        const pingGain = this.ctx.createGain();
        
        pingOsc.type = "sine";
        // Warm, cozy pentatonic frequencies (A3, C4, D4, E4, G4, A4) instead of harsh 1000Hz beeps
        const pentatonic = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        pingOsc.frequency.setValueAtTime(freq, now);
        
        pingFilter.type = "lowpass";
        pingFilter.frequency.setValueAtTime(freq * 1.5, now);
        
        pingGain.gain.setValueAtTime(0, now);
        // Soft envelope with gentle attack and a lovely warm decay
        pingGain.gain.linearRampToValueAtTime(this.pingVolume * 1.1, now + 0.015);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
        
        pingOsc.connect(pingFilter);
        pingFilter.connect(pingGain);
        pingGain.connect(this.masterGain);
        
        pingOsc.start(now);
        pingOsc.stop(now + 0.9);
      } catch (e) {
        // Safe catch
      }
    };
    
    this.pingIntervalId = setInterval(() => {
      if (Math.random() < 0.35) {
        triggerPing();
      }
    }, 2500);
  }

  private stopPings() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  /**
   * Play a pleasant cybersecurity security handshake chime
   * Consists of an elegant, slower-arpeggiated lush chord of warm sine tones
   */
  playSecurityHandshake() {
    // If master is not active, try initializing once if there's user interaction
    if (!this.isMasterActive) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      
      const now = this.ctx.currentTime;
      // High-end, ultra-warm, low-mid Major 9th / Add9 chord arpeggio:
      // F3 (174.61), C4 (261.63), A4 (440.00), C5 (523.25), E5 (659.25), G5 (783.99)
      const frequencies = [174.61, 261.63, 440.00, 523.25, 659.25, 783.99];
      const arpeggioDelay = 0.12; // Much slower, calmer, and more majestic
      
      frequencies.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteOsc = this.ctx.createOscillator();
        const noteFilter = this.ctx.createBiquadFilter();
        const noteGain = this.ctx.createGain();
        
        // Use triangle wave filtered slightly for a premium Rhodes electric piano warmth
        noteOsc.type = "triangle";
        noteOsc.frequency.setValueAtTime(freq, now + idx * arpeggioDelay);
        
        noteFilter.type = "lowpass";
        noteFilter.frequency.setValueAtTime(freq * 2.2, now + idx * arpeggioDelay);
        
        const noteStartTime = now + idx * arpeggioDelay;
        
        noteGain.gain.setValueAtTime(0, noteStartTime);
        // Beautiful click-free, soft attack envelope
        noteGain.gain.linearRampToValueAtTime(this.pingVolume * 1.5, noteStartTime + 0.045);
        // Generous acoustic decay
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 1.8);
        
        noteOsc.connect(noteFilter);
        noteFilter.connect(noteGain);
        noteGain.connect(this.masterGain);
        
        noteOsc.start(noteStartTime);
        noteOsc.stop(noteStartTime + 1.9);
      });
    } catch (e) {
      console.warn("Security handshake chime failed to play:", e);
    }
  }

  /**
   * Play a subtle tactile futuristic click sound for general cyber HUD button taps
   */
  playClickSound() {
    if (!this.isMasterActive) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      
      const now = this.ctx.currentTime;
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      
      clickOsc.type = "sine";
      // Redesigned to be a deep-bodied, low-mid smartphone style haptic pop rather than a high laser chirp
      clickOsc.frequency.setValueAtTime(380, now);
      clickOsc.frequency.exponentialRampToValueAtTime(80, now + 0.012);
      
      clickGain.gain.setValueAtTime(0, now);
      clickGain.gain.linearRampToValueAtTime(this.pingVolume * 1.4, now + 0.002);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
      
      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);
      
      clickOsc.start(now);
      clickOsc.stop(now + 0.015);
    } catch (e) {
      // Catch silently
    }
  }

  /**
   * Play a subtle, randomized mechanical keyboard-like tick or high-tech tap for keystrokes
   */
  playKeyboardClick() {
    if (!this.isMasterActive) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      
      const now = this.ctx.currentTime;
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      
      // Randomize starting frequency slightly for natural, organic keystroke variation
      const baseFreq = 700 + Math.random() * 500;
      const targetFreq = 150 + Math.random() * 100;
      const duration = 0.004 + Math.random() * 0.006; // extremely short transient (4-10ms)
      
      clickOsc.type = "triangle"; // soft, wood/felt tactile sound
      clickOsc.frequency.setValueAtTime(baseFreq, now);
      clickOsc.frequency.exponentialRampToValueAtTime(targetFreq, now + duration);
      
      clickGain.gain.setValueAtTime(0, now);
      // Extremely low, subtle keystroke volume scaled by the pingVolume setting
      const clickVol = this.pingVolume * (0.12 + Math.random() * 0.12);
      clickGain.gain.linearRampToValueAtTime(clickVol, now + 0.001);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      
      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);
      
      clickOsc.start(now);
      clickOsc.stop(now + duration + 0.005);
    } catch (e) {
      // Catch silently
    }
  }

  setMasterActive(active: boolean) {
    this.isMasterActive = active;
    try {
      localStorage.setItem("kra_audio_master", active.toString());
    } catch (e) {}
    
    if (active) {
      this.init();
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      this.startPings();
      this.startHum();
    } else {
      this.stopHum();
      this.stopPings();
    }
    
    if (this.ctx && this.masterGain) {
      const targetGain = active ? 1.0 : 0.0;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
    }
    this.notify();
  }

  setHumActive(active: boolean) {
    this.isHumActive = active;
    try {
      localStorage.setItem("kra_audio_hum", active.toString());
    } catch (e) {}
    
    if (this.ctx && this.humGain) {
      const targetGain = active ? this.humVolume : 0.0;
      this.humGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
      if (active) {
        this.startSequencer();
      } else {
        this.stopSequencer();
      }
    } else if (active && this.ctx) {
      this.startHum();
    }
    this.notify();
  }

  setPingsActive(active: boolean) {
    this.isPingsActive = active;
    try {
      localStorage.setItem("kra_audio_pings", active.toString());
    } catch (e) {}
    this.notify();
  }

  setHumVolume(vol: number) {
    this.humVolume = vol;
    try {
      localStorage.setItem("kra_audio_hum_vol", vol.toString());
    } catch (e) {}
    if (this.ctx && this.humGain && this.isHumActive) {
      this.humGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.08);
    }
    this.notify();
  }

  setPingVolume(vol: number) {
    this.pingVolume = vol;
    try {
      localStorage.setItem("kra_audio_ping_vol", vol.toString());
    } catch (e) {}
    this.notify();
  }

  getBgmPreset() {
    return this.bgmPreset;
  }

  setBgmPreset(preset: "mr_robot" | "tron" | "social_network") {
    this.bgmPreset = preset;
    try {
      localStorage.setItem("kra_audio_bgm_preset", preset);
    } catch (e) {}
    
    this.playClickSound();
    
    if (this.isMasterActive && this.isHumActive) {
      this.startSequencer();
    }
    this.notify();
  }

  getSettings() {
    return {
      master: this.isMasterActive,
      hum: this.isHumActive,
      pings: this.isPingsActive,
      humVolume: this.humVolume,
      pingVolume: this.pingVolume,
      bgmPreset: this.bgmPreset,
    };
  }
}

export const audioSystem = new AudioSystem();
