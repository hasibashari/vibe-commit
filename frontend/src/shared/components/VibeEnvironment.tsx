import React from 'react';
import { motion } from 'motion/react';

interface VibeEnvironmentProps {
  anxietyScore?: number;
  sigmaVariance?: number;
  customMainBg?: string;
  themeVibe?: string;
}

const THEMES: Record<string, any> = {
  midnight: {
    bg: 'bg-[#020617]',
    overlayLush: 'from-[#0A0C10]/60 via-[#0A0C10]/10 to-[#0A0C10]',
    overlayDark: 'from-[#0A0C10]/80 via-[#0A0C10]/20 to-[#0A0C10]',
    vignette: 'bg-[radial-gradient(circle_at_center,transparent_0%,#0A0C10_100%)]',
    hueLush: 'hue-rotate(170deg) saturate(1.2)',
    hueDark: 'hue-rotate(220deg) saturate(0.8)',
    baseImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=3000&auto=format&fit=crop'
  },
  emerald: {
    bg: 'bg-[#022c22]',
    overlayLush: 'from-[#064e3b]/60 via-[#064e3b]/10 to-[#022c22]',
    overlayDark: 'from-[#064e3b]/80 via-[#064e3b]/20 to-[#022c22]',
    vignette: 'bg-[radial-gradient(circle_at_center,transparent_0%,#022c22_100%)]',
    hueLush: 'hue-rotate(90deg) saturate(1.5)',
    hueDark: 'hue-rotate(120deg) saturate(0.9)',
    baseImage: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=3000&auto=format&fit=crop'
  },
  neon: {
    bg: 'bg-[#1e1b4b]',
    overlayLush: 'from-[#2e1065]/60 via-[#4c1d95]/10 to-[#1e1b4b]',
    overlayDark: 'from-[#2e1065]/80 via-[#4c1d95]/20 to-[#1e1b4b]',
    vignette: 'bg-[radial-gradient(circle_at_center,transparent_0%,#1e1b4b_100%)]',
    hueLush: 'hue-rotate(280deg) saturate(2)',
    hueDark: 'hue-rotate(300deg) saturate(1.2)',
    baseImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=3000&auto=format&fit=crop'
  },
  sunset: {
    bg: 'bg-[#450a0a]',
    overlayLush: 'from-[#7f1d1d]/60 via-[#991b1b]/10 to-[#450a0a]',
    overlayDark: 'from-[#7f1d1d]/80 via-[#991b1b]/20 to-[#450a0a]',
    vignette: 'bg-[radial-gradient(circle_at_center,transparent_0%,#450a0a_100%)]',
    hueLush: 'hue-rotate(340deg) saturate(1.5)',
    hueDark: 'hue-rotate(360deg) saturate(1)',
    baseImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3000&auto=format&fit=crop'
  },
  matrix: {
    bg: 'bg-[#000000]',
    overlayLush: 'from-[#00ff00]/20 via-[#00ff00]/5 to-[#000000]',
    overlayDark: 'from-[#00ff00]/40 via-[#00ff00]/10 to-[#000000]',
    vignette: 'bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]',
    hueLush: 'hue-rotate(100deg) saturate(3)',
    hueDark: 'hue-rotate(120deg) saturate(2)',
    baseImage: 'https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=3000&auto=format&fit=crop'
  }
};

export const VibeEnvironment: React.FC<VibeEnvironmentProps> = ({ 
  anxietyScore = 5, 
  sigmaVariance = 1.0,
  customMainBg,
  themeVibe = 'midnight'
}) => {
  // If Anxiety score is LOW (i.e., Anxiety Reduction Rate is HIGH), it's bright and lush.
  const isLush = anxietyScore <= 5;
  
  // High variance (sigma) implies procrastination risk -> add procedural fog
  // Variance mapping: Assuming typical sigma ranges 0 to 5
  const fogOpacity = Math.min(0.8, sigmaVariance * 0.15);

  const theme = THEMES[themeVibe] || THEMES.midnight;

  return (
    <div className={`fixed inset-0 z-[-1] pointer-events-none overflow-hidden transition-colors duration-[2000ms] ${theme.bg}`}>
      
      {/* 1. Cinematic RPG Background Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-[center_top] bg-no-repeat transition-all duration-[3000ms] ease-in-out ${
          isLush ? 'opacity-[0.35] mix-blend-screen' : 'opacity-[0.15] mix-blend-luminosity grayscale-[50%]'
        }`}
        style={{
          // A stylized dark fantasy / Sci-Fi moody landscape
          backgroundImage: `url('${customMainBg || theme.baseImage}')`,
          filter: customMainBg ? 'none' : (isLush ? theme.hueLush : theme.hueDark)
        }}
      />

      {/* 2. Atmosphere & Readability Overlays */}
      <div className={`absolute inset-0 bg-gradient-to-b transition-all duration-[2000ms] ease-in-out ${
        isLush ? theme.overlayLush : theme.overlayDark
      }`} />
      
      {/* Cinematic Vignette */}
      <div className={`absolute inset-0 pointer-events-none opacity-80 ${theme.vignette}`} />

      {/* 3. Fog / Cloud Effects (Procrastination Visualizer) */}
      {fogOpacity > 0 && (
        <React.Fragment>
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-slate-200 to-transparent mix-blend-overlay transition-opacity duration-1000 pointer-events-none"
            style={{ opacity: fogOpacity * 0.5 }}
          />
          <motion.div 
            animate={{ x: [0, -200, 0] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className="absolute bottom-[15vh] -left-[50%] w-[200%] h-[20vh] bg-gradient-to-r from-transparent via-slate-400/10 to-transparent blur-3xl pointer-events-none"
            style={{ opacity: fogOpacity + 0.2 }}
          />
        </React.Fragment>
      )}


    </div>
  );
};
