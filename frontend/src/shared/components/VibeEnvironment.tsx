import React from 'react';
import { motion } from 'motion/react';
import { useMouseParallax } from '../hooks/useMouseParallax';
import { getWeatherState } from '../utils/weatherUtils';

interface VibeEnvironmentProps {
  anxietyScore?: number;
  sigmaVariance?: number;
  customMainBg?: string;
  themeVibe?: string;
  hp?: number;
}

const THEMES: Record<string, any> = {
  midnight: {
    bg: 'bg-[#020617]',
    overlayBase: 'from-[#0A0C10]/60 via-[#0A0C10]/20 to-[#0A0C10]',
    overlayDark: 'from-[#0A0C10]/75 via-[#0A0C10]/35 to-[#0A0C10]/85',
    vignette: 'bg-[radial-gradient(ellipse_at_top,transparent_0%,#0A0C10_100%)]',
    hueBase: 'none',
    hueDark: 'grayscale(0.35) brightness(0.8)',
    baseImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=3000&auto=format&fit=crop',
    glow: 'bg-cyan-500/20'
  },
  emerald: {
    bg: 'bg-[#011a14]',
    overlayBase: 'from-[#022c22]/60 via-[#011a14]/40 to-[#011a14]',
    overlayDark: 'from-[#022c22]/75 via-[#011a14]/35 to-[#011a14]/85',
    vignette: 'bg-[radial-gradient(ellipse_at_top,transparent_0%,#011a14_100%)]',
    hueBase: 'none',
    hueDark: 'grayscale(0.2) brightness(0.75)',
    baseImage: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=3000&auto=format&fit=crop',
    glow: 'bg-emerald-500/15'
  },
  neon: {
    bg: 'bg-[#090014]',
    overlayBase: 'from-[#2e1065]/60 via-[#090014]/40 to-[#090014]',
    overlayDark: 'from-[#2e1065]/75 via-[#090014]/45 to-[#090014]/85',
    vignette: 'bg-[radial-gradient(ellipse_at_top,transparent_0%,#090014_100%)]',
    hueBase: 'saturate(1.5)',
    hueDark: 'saturate(0.8) brightness(0.8)',
    baseImage: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?q=80&w=3000&auto=format&fit=crop',
    glow: 'bg-fuchsia-500/20'
  },
  sunset: {
    bg: 'bg-[#1a0500]',
    overlayBase: 'from-[#450a0a]/50 via-[#1a0500]/40 to-[#1a0500]',
    overlayDark: 'from-[#450a0a]/75 via-[#1a0500]/45 to-[#1a0500]/85',
    vignette: 'bg-[radial-gradient(ellipse_at_top,transparent_0%,#1a0500_100%)]',
    hueBase: 'saturate(1.2) contrast(1.1)',
    hueDark: 'saturate(0.6) brightness(0.75)',
    baseImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3000&auto=format&fit=crop',
    glow: 'bg-orange-500/15'
  },
  matrix: {
    bg: 'bg-[#000501]',
    overlayBase: 'from-[#002b11]/60 via-[#000501]/40 to-[#000501]',
    overlayDark: 'from-[#002b11]/75 via-[#000501]/45 to-[#000501]/85',
    vignette: 'bg-[radial-gradient(ellipse_at_top,transparent_0%,#000501_100%)]',
    hueBase: 'contrast(1.2) saturate(1.5)',
    hueDark: 'brightness(0.75)',
    baseImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=3000&auto=format&fit=crop',
    glow: 'bg-green-500/10'
  }
};

const SunsetLight = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-60 z-10">
      <motion.div 
        className="absolute top-0 right-[-10%] w-[50%] h-[120%] bg-linear-to-l from-orange-400/30 to-transparent blur-[100px] origin-right"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[10%] right-0 w-[40%] h-[80%] bg-linear-to-l from-amber-300/20 to-transparent blur-[80px]"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div 
        className="absolute bottom-0 left-[-10%] w-[40%] h-[80%] bg-linear-to-r from-rose-400/20 to-transparent blur-[120px]"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
};

const OvercastClouds = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-70">
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[70%] h-[50%] bg-slate-400/20 blur-[80px] rounded-full mix-blend-overlay"
        animate={{ x: [0, 50, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-slate-500/20 blur-[100px] rounded-full mix-blend-overlay"
        animate={{ x: [0, -60, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div 
        className="absolute bottom-[-20%] left-[20%] w-[80%] h-[50%] bg-slate-600/15 blur-[120px] rounded-full mix-blend-overlay"
        animate={{ x: [-30, 40, -30], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply" />
    </div>
  );
};

const HeartbeatVignette = () => {
  return (
    <motion.div 
      className="absolute inset-0 pointer-events-none mix-blend-multiply z-20"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(220, 38, 38, 0.3) 100%)'
      }}
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
};

export const VibeEnvironment: React.FC<VibeEnvironmentProps> = ({ 
  anxietyScore = 5, 
  sigmaVariance = 1.0,
  customMainBg,
  themeVibe = 'midnight',
  hp = 100
}) => {
  const weather = getWeatherState(anxietyScore, sigmaVariance);
  const isCriticalHp = hp < 20;
  const theme = THEMES[themeVibe] || THEMES.midnight;

  // Instability representation: Amplified parallax when sigma variance is high
  const instabilityMultiplier = Math.max(1, sigmaVariance / 1.2);
  const { x: parallaxX, y: parallaxY } = useMouseParallax(10, instabilityMultiplier);

  const getBgStyleClasses = () => {
    switch (weather) {
      case 'rainy':
        return 'blur-[2px] opacity-[0.38] mix-blend-luminosity grayscale-[30%]';
      case 'overcast':
        return 'blur-[2px] opacity-[0.35] mix-blend-luminosity grayscale-[20%]';
      case 'sunny':
      case 'default':
      default:
        return 'blur-none opacity-[0.4] mix-blend-screen';
    }
  };

  return (
    <div className={`fixed inset-0 z-[-1] pointer-events-none overflow-hidden transition-colors duration-2000 ${theme.bg}`}>
      
      <motion.div 
        className={`absolute inset-[-30px] bg-cover bg-position-[center_top] bg-no-repeat transition-all duration-3000 ease-in-out ${getBgStyleClasses()}`}
        style={{
          backgroundImage: `url('${customMainBg || theme.baseImage}')`,
          filter: customMainBg ? 'none' : (weather === 'rainy' ? theme.hueDark : theme.hueBase),
          x: parallaxX,
          y: parallaxY,
          scale: 1.02
        }}
      />

      <div className={`absolute inset-0 bg-linear-to-b transition-all duration-2000 ease-in-out ${
         weather === 'rainy' ? theme.overlayDark : theme.overlayBase
      }`} />
      
      {theme.glow && (
        <div className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] blur-[120px] rounded-[100%] pointer-events-none mix-blend-screen transition-opacity duration-3000 ${theme.glow} ${
          weather === 'rainy' ? 'opacity-20' : (weather === 'overcast' ? 'opacity-30' : 'opacity-100')
        }`} />
      )}

      <div className={`absolute inset-0 pointer-events-none opacity-80 ${theme.vignette}`} />

      {weather === 'sunny' && <SunsetLight />}
      {weather === 'overcast' && <OvercastClouds />}
      
      {isCriticalHp && <HeartbeatVignette />}

    </div>
  );
};
