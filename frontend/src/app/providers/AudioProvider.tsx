import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAppContext } from './AppProvider';

interface AudioContextType {
  playVictorySound: () => void;
  playLevelUpSound: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const BGM_THEMES: Record<string, string> = {
  // Relaxing nature/acoustic for lush state
  'nature': '/sounds/nature.mp3',
  // Dark ambient/Synth for dark state
  'cyber': '/sounds/cyber.mp3',
  // Lo-Fi Cafe
  'coffee': '/sounds/coffee.mp3',
};

// Fallback tracks (Optional, leaving them same or removing them since we use local)
const FALLBACK_BGM = {
  'nature': '/sounds/nature.mp3',
  'cyber': '/sounds/cyber.mp3',
  'coffee': '/sounds/coffee.mp3',
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const { user, updateProfile, latestDump } = useAppContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize from user settings
  useEffect(() => {
    if (user?.bgm_muted !== undefined) {
      setIsMuted(!!user.bgm_muted);
    }
  }, [user?.bgm_muted]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0; // start silent
    }
  }, []);

  // Adaptive BGM Logic
  useEffect(() => {
    if (!audioRef.current || !user) return;
    
    // Choose theme track based on user setting or calculate vibe
    // Let's use user settings if provided. If we want it dynamic based on Anxiety:
    // the user mentioned "Kita buat satu konduktor yang memantau state Anxiety dan Mana"
    // and "Saat Suasana Lush (Anxiety Rendah) -> Nature ... Saat Suasana Dark -> Lo-Fi".
    // Or we provide 3 options in settings: 'dynamic', 'nature', 'cyber', 'coffee'.
    
    let preferredTheme = user.bgm_theme || 'dynamic';
    
    // Let's implement Dynamic
    if (preferredTheme === 'dynamic') {
      const anxiety = latestDump?.anxietyScore || 5;
      if (anxiety > 7) {
        preferredTheme = 'cyber'; // Dark/Foggy
      } else if (anxiety > 4) {
        preferredTheme = 'coffee'; // Neutral
      } else {
        preferredTheme = 'nature'; // Lush
      }
    }

    const newSrc = BGM_THEMES[preferredTheme] || BGM_THEMES['nature'];
    const audio = audioRef.current;

    // A simple fade in/out
    const fadeOut = () => {
      let v = audio.volume;
      const interval = setInterval(() => {
        v -= 0.05;
        if (v <= 0) {
          v = 0;
          audio.volume = v;
          clearInterval(interval);
          
          audio.src = newSrc;
          if (!isMuted) fadeIn();
        } else {
          audio.volume = v;
        }
      }, 50);
    };

    const fadeIn = () => {
      audio.play().catch(() => { /* Auto-play restrictions */ });
      let v = audio.volume;
      const interval = setInterval(() => {
        v += 0.02;
        if (v >= 0.15) { // Max volume for ambient background
          v = 0.15;
          audio.volume = v;
          clearInterval(interval);
        } else {
          audio.volume = v;
        }
      }, 100);
    };

    if (audio.src !== newSrc && audio.src) {
      // Different track, fade out then change
      fadeOut();
    } else if (!audio.src) {
      audio.src = newSrc;
      if (!isMuted) fadeIn();
    } else {
      // Same track, just handle volume
      if (isMuted) {
         audio.volume = 0;
         audio.pause();
      } else {
         if (audio.paused) audio.play().catch(()=>console.log('Play blocked'));
         if (audio.volume < 0.15) fadeIn();
      }
    }
    
    // Attempt play on mount if not muted
    if (!isMuted && audio.paused) {
      audio.play().catch(() => {
          // Play requires user interaction first, this will naturally be blocked until they click
      });
    }

  }, [bgmThemeCalc(), isMuted]);

  function bgmThemeCalc() {
     if (!user) return 'nature';
     if (user.bgm_theme && user.bgm_theme !== 'dynamic') return user.bgm_theme;
     const anxiety = latestDump?.anxietyScore || 5;
     if (anxiety > 7) return 'cyber';
     if (anxiety > 4) return 'coffee';
     return 'nature';
  }

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    updateProfile({ bgm_muted: nextMuted ? 1 : 0 } as any);
  };

  const playVictorySound = () => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'square';
      
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(261.63, now); // C4
      osc.frequency.setValueAtTime(329.63, now + 0.1); // E4
      osc.frequency.setValueAtTime(392.00, now + 0.2); // G4
      osc.frequency.setValueAtTime(523.25, now + 0.3); // C5
      
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc.start(now);
      osc.stop(now + 0.6);
    } catch(e) {}
  };

  const playLevelUpSound = () => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.1); 
      osc.frequency.setValueAtTime(659.25, now + 0.2); 
      osc.frequency.setValueAtTime(880, now + 0.3); 
      
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      
      osc.start(now);
      osc.stop(now + 1.0);
    } catch(e) {}
  };

  return (
    <AudioContext.Provider value={{ playVictorySound, playLevelUpSound, toggleMute, isMuted }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
