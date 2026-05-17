import React, { useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface VibeEnvironmentProps {
  anxietyScore?: number;
  sigmaVariance?: number;
  customMainBg?: string;
  themeVibe?: string;
  hp?: number; // Added hp for heartbeat effect
}

const THEMES: Record<string, any> = {
  midnight: {
    bg: 'bg-[#020617]',
    overlayLush: 'from-[#0A0C10]/60 via-[#0A0C10]/20 to-[#0A0C10]',
    overlayDark: 'from-[#0A0C10]/90 via-[#0A0C10]/50 to-[#0A0C10]',
    vignette: 'bg-[radial-gradient(ellipse_at_top,transparent_0%,#0A0C10_100%)]',
    hueLush: 'none',
    hueDark: 'grayscale(0.5) brightness(0.7)',
    baseImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=3000&auto=format&fit=crop',
    glow: 'bg-cyan-500/20'
  },
  emerald: {
    bg: 'bg-[#011a14]',
    overlayLush: 'from-[#022c22]/60 via-[#011a14]/40 to-[#011a14]',
    overlayDark: 'from-[#022c22]/90 via-[#011a14]/60 to-[#011a14]',
    vignette: 'bg-[radial-gradient(ellipse_at_top,transparent_0%,#011a14_100%)]',
    hueLush: 'none',
    hueDark: 'grayscale(0.3) brightness(0.6)',
    baseImage: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=3000&auto=format&fit=crop',
    glow: 'bg-emerald-500/15'
  },
  neon: {
    bg: 'bg-[#090014]',
    overlayLush: 'from-[#2e1065]/60 via-[#090014]/40 to-[#090014]',
    overlayDark: 'from-[#2e1065]/90 via-[#090014]/70 to-[#090014]',
    vignette: 'bg-[radial-gradient(ellipse_at_top,transparent_0%,#090014_100%)]',
    hueLush: 'saturate(1.5)',
    hueDark: 'saturate(0.8) brightness(0.7)',
    baseImage: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?q=80&w=3000&auto=format&fit=crop',
    glow: 'bg-fuchsia-500/20'
  },
  sunset: {
    bg: 'bg-[#1a0500]',
    overlayLush: 'from-[#450a0a]/50 via-[#1a0500]/40 to-[#1a0500]',
    overlayDark: 'from-[#450a0a]/90 via-[#1a0500]/70 to-[#1a0500]',
    vignette: 'bg-[radial-gradient(ellipse_at_top,transparent_0%,#1a0500_100%)]',
    hueLush: 'saturate(1.2) contrast(1.1)',
    hueDark: 'saturate(0.5) brightness(0.6)',
    baseImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3000&auto=format&fit=crop',
    glow: 'bg-orange-500/15'
  },
  matrix: {
    bg: 'bg-[#000501]',
    overlayLush: 'from-[#002b11]/60 via-[#000501]/40 to-[#000501]',
    overlayDark: 'from-[#002b11]/90 via-[#000501]/70 to-[#000501]',
    vignette: 'bg-[radial-gradient(ellipse_at_top,transparent_0%,#000501_100%)]',
    hueLush: 'contrast(1.2) saturate(1.5)',
    hueDark: 'brightness(0.6)',
    baseImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=3000&auto=format&fit=crop',
    glow: 'bg-green-500/10'
  }
};

// Hook for generating static random arrays across re-renders
const useMemoizedParticles = (count: number) => {
  return useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 10 + Math.random() * 20,
      delay: -Math.random() * 20,
      randomX1: (Math.random() - 0.5) * 100,
      randomX2: (Math.random() - 0.5) * 50,
      size: Math.random() * 0.5 + 0.5
    }));
  }, [count]);
};

// 1. Floating Particles System (Fireflies vs Ash Embers)
const FloatingParticles = ({ isAnxious }: { isAnxious: boolean }) => {
  const particles = useMemoizedParticles(40);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-70">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[1px] ${
            isAnxious ? 'bg-orange-600/80 shadow-[0_0_6px_rgba(234,88,12,0.8)]' : 'bg-emerald-300/80 shadow-[0_0_8px_rgba(110,231,183,0.8)]'
          }`}
          style={{ 
            left: `${p.x}%`,
            width: `${isAnxious ? 4 * p.size : 6 * p.size}px`,
            height: `${isAnxious ? 4 * p.size : 6 * p.size}px`,
          }}
          initial={false}
          animate={{
            y: isAnxious ? ['-10vh', '110vh'] : ['110vh', '-10vh'],
            opacity: [0, 1, 0.8, 0],
            x: [0, p.randomX1, p.randomX2]
          }}
          transition={{
            duration: p.duration * (isAnxious ? 0.6 : 1), // Embers fall faster
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
};

// 2. Weather Effects (Digital Rain)
const DigitalRain = () => {
  const drops = useMemoizedParticles(60);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {drops.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent"
          style={{ 
            left: `${p.x}%`,
            height: `${10 + p.size * 20}vh`
          }}
          animate={{
            y: ['-20vh', '120vh'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: p.duration * 0.05, 
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
};

// 3. God Rays / Sun Beams (For Lush/Productive states)
const GodRays = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-40 z-10">
      <motion.div 
        className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] bg-gradient-to-b from-amber-200/20 to-transparent blur-[60px] transform rotate-[-30deg] origin-top-left"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute -top-[10%] left-[10%] w-[40%] h-[150%] bg-gradient-to-b from-amber-100/10 to-transparent blur-[80px] transform rotate-[-25deg] origin-top-left"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
};

// 4. Critical HP Heartbeat Vignette
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
  // If Anxiety score is LOW (i.e., Anxiety Reduction Rate is HIGH), it's bright and lush.
  const isLush = anxietyScore <= 5;
  const isHighAnxiety = anxietyScore > 7;
  const isCriticalHp = hp < 20;
  
  // High variance (sigma) implies procrastination risk -> add procedural fog
  // Variance mapping: Assuming typical sigma ranges 0 to 5
  const fogOpacity = Math.min(0.8, sigmaVariance * 0.15);

  const theme = THEMES[themeVibe] || THEMES.midnight;

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 100, mass: 0.5 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);
  
  // Opposite subtle movement
  const parallaxX = useTransform(mouseXSpring, [-1, 1], [15, -15]);
  const parallaxY = useTransform(mouseYSpring, [-1, 1], [15, -15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1 based on viewport
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className={`fixed inset-0 z-[-1] pointer-events-none overflow-hidden transition-colors duration-[2000ms] ${theme.bg}`}>
      
      {/* 1. Cinematic RPG Background Image with Parallax */}
      <motion.div 
        className={`absolute -inset-[30px] bg-cover bg-[center_top] bg-no-repeat transition-all duration-[3000ms] ease-in-out ${
          isLush ? 'opacity-[0.35] mix-blend-screen' : 'opacity-[0.15] mix-blend-luminosity grayscale-[50%]'
        }`}
        style={{
          backgroundImage: `url('${customMainBg || theme.baseImage}')`,
          filter: customMainBg ? 'none' : (isLush ? theme.hueLush : theme.hueDark),
          x: parallaxX,
          y: parallaxY,
          scale: 1.02 // Prevent edges from showing during parallax
        }}
      />

      {/* 2. Atmosphere & Readability Overlays */}
      <div className={`absolute inset-0 bg-gradient-to-b transition-all duration-[2000ms] ease-in-out ${
        isLush ? theme.overlayLush : theme.overlayDark
      }`} />
      
      {/* Theme specific cinematic light orb */}
      {theme.glow && (
        <div className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] blur-[120px] rounded-[100%] pointer-events-none mix-blend-screen transition-all duration-[3000ms] ${theme.glow}`} />
      )}

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

      {/* LIVING VIBE SYSTEM EXTENSIONS */}
      <FloatingParticles isAnxious={!isLush} />
      {isHighAnxiety && <DigitalRain />}
      {isLush && <GodRays />}
      {isCriticalHp && <HeartbeatVignette />}

    </div>
  );
};
