import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useMemo } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';

interface AudioContextType {
  playVictorySound: () => void;
  playLevelUpSound: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

const AudioPlayerContext = createContext<AudioContextType | undefined>(undefined);

const BGM_THEMES: Record<string, string> = {
  // Relaxing nature/acoustic for lush state
  'nature': '/sounds/nature.mp3',
  // Dark ambient/Synth for dark state
  'cyber': '/sounds/cyber.mp3',
  // Lo-Fi Cafe
  'coffee': '/sounds/coffee.mp3',
};

let sharedAudioCtx: AudioContext | null = null;
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch(e) {}
  }
  return sharedAudioCtx;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const { user, updateProfile, latestDump } = useDashboardStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);
  const isUnlockedRef = useRef(false);
  const currentTrackRef = useRef<string | null>(null);

  // Initialize from user settings
  useEffect(() => {
    if (user?.bgm_muted !== undefined) {
      setIsMuted(!!user.bgm_muted);
    }
  }, [user?.bgm_muted]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0; // start silent
    }

    const unlockAudio = () => {
      if (isUnlockedRef.current) return;
      isUnlockedRef.current = true;
      
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }

      const audio = audioRef.current;
      if (audio && audio.src && audio.src !== window.location.href && !isMutedRef.current) {
        audio.play().catch(() => {});
        // Hanya fade in jika volume masih 0
        if (audio.volume === 0) {
           let v = 0;
           const interval = setInterval(() => {
             v += 0.02;
             if (v >= 0.15) { 
               v = 0.15;
               audio.volume = v;
               clearInterval(interval);
             } else {
               audio.volume = v;
             }
           }, 100);
        }
      }
      
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const currentTheme = useMemo(() => {
     if (!user) return 'nature';
     if (user.bgm_theme && user.bgm_theme !== 'dynamic') return user.bgm_theme;
     const anxiety = latestDump?.anxietyScore || 5;
     if (anxiety > 7) return 'cyber';
     if (anxiety > 4) return 'coffee';
     return 'nature';
  }, [user?.bgm_theme, latestDump?.anxietyScore, user]);

  // Adaptive BGM Logic
  useEffect(() => {
    if (!audioRef.current) return;

    const newSrc = BGM_THEMES[currentTheme] || BGM_THEMES['nature'];
    const audio = audioRef.current;

    const fadeOut = () => {
      let v = audio.volume;
      const interval = setInterval(() => {
        v -= 0.05;
        if (v <= 0) {
          v = 0;
          audio.volume = 0;
          clearInterval(interval);
          
          audio.src = newSrc;
          if (!isMuted && isUnlockedRef.current) fadeIn();
        } else {
          audio.volume = v;
        }
      }, 50);
    };

    const fadeIn = () => {
      if (isMuted || !isUnlockedRef.current) return;
      if (!audio.src || audio.src === window.location.href) return;
      audio.play().catch(() => {});
      let v = audio.volume;
      const interval = setInterval(() => {
        v += 0.02;
        if (v >= 0.15) { 
          v = 0.15;
          audio.volume = v;
          clearInterval(interval);
        } else {
          audio.volume = v;
        }
      }, 100);
    };

    if (currentTrackRef.current !== newSrc) {
       currentTrackRef.current = newSrc;
       if (audio.src && audio.src !== window.location.href) {
          fadeOut();
       } else {
          audio.src = newSrc;
          if (!isMuted && isUnlockedRef.current) fadeIn();
       }
    } else {
       if (isMuted) {
          audio.volume = 0;
          audio.pause();
       } else {
          if (audio.paused && isUnlockedRef.current) audio.play().catch(()=>{});
          if (audio.volume < 0.15) fadeIn();
       }
    }
  }, [currentTheme, isMuted]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    updateProfile({ bgm_muted: nextMuted ? 1 : 0 }, true); // Pass silent=true
  };

  const playVictorySound = () => {
    if (isMuted || !isUnlockedRef.current) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
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
    if (isMuted || !isUnlockedRef.current) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
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
    <AudioPlayerContext.Provider value={{ playVictorySound, playLevelUpSound, toggleMute, isMuted }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
