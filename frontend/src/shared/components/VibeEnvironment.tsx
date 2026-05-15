import React from 'react';
import { motion } from 'motion/react';

interface VibeEnvironmentProps {
  anxietyScore?: number;
  sigmaVariance?: number;
}

export const VibeEnvironment: React.FC<VibeEnvironmentProps> = ({ 
  anxietyScore = 5, 
  sigmaVariance = 1.0
}) => {
  // If Anxiety score is LOW (i.e., Anxiety Reduction Rate is HIGH), it's bright and lush.
  const isLush = anxietyScore <= 5;
  
  // High variance (sigma) implies procrastination risk -> add procedural fog
  // Variance mapping: Assuming typical sigma ranges 0 to 5
  const fogOpacity = Math.min(0.8, sigmaVariance * 0.15);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden transition-colors duration-[2000ms] bg-[#020617]">
      
      {/* 1. Cinematic RPG Background Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-[center_top] bg-no-repeat transition-all duration-[3000ms] ease-in-out ${
          isLush ? 'opacity-[0.35] mix-blend-screen' : 'opacity-[0.15] mix-blend-luminosity grayscale-[50%]'
        }`}
        style={{
          // A stylized dark fantasy / Sci-Fi moody landscape
          backgroundImage: `url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=3000&auto=format&fit=crop')`,
          filter: isLush ? 'hue-rotate(170deg) saturate(1.2)' : 'hue-rotate(220deg) saturate(0.8)'
        }}
      />

      {/* 2. Atmosphere & Readability Overlays */}
      <div className={`absolute inset-0 bg-gradient-to-b transition-all duration-[2000ms] ease-in-out ${
        isLush 
          ? 'from-[#0A0C10]/60 via-[#0A0C10]/10 to-[#0A0C10]' 
          : 'from-[#0A0C10]/80 via-[#0A0C10]/20 to-[#0A0C10]'
      }`} />
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0C10_100%)] pointer-events-none opacity-80" />

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
