import React from 'react';
import { motion } from 'motion/react';

export const CharacterSprite: React.FC = () => {
  return (
    <motion.div
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut"
      }}
      className="relative w-40 h-40 drop-shadow-2xl z-10"
    >
      <svg viewBox="0 0 32 32" className="w-full h-full" shapeRendering="crispEdges">
        {/* Character Back View */}
        {/* Hood / Hat */}
        <rect x="10" y="4" width="12" height="12" fill="#0f172a" />
        <rect x="8" y="8" width="16" height="8" fill="#0f172a" />
        <rect x="12" y="2" width="8" height="2" fill="#0f172a" />
        <rect x="12" y="3" width="8" height="1" fill="#38bdf8" opacity="0.4" />
        
        {/* Scarf / Collar from back */}
        <rect x="10" y="16" width="12" height="3" fill="#0ea5e9" />
        
        {/* Body Armor/Coat back view */}
        <rect x="10" y="19" width="12" height="10" fill="#1e293b" />
        <rect x="13" y="19" width="6" height="10" fill="#0f172a" /> {/* Back spine plating */}
        
        {/* Arms (Resting by the sides) */}
        <rect x="6" y="19" width="4" height="8" fill="#334155" />
        <rect x="22" y="19" width="4" height="8" fill="#334155" />
        
        {/* Hands / Gauntlets */}
        <rect x="6" y="27" width="4" height="2" fill="#0ea5e9" />
        <rect x="22" y="27" width="4" height="2" fill="#0ea5e9" />
        
        {/* Legs */}
        <rect x="12" y="29" width="3" height="3" fill="#020617" />
        <rect x="11" y="32" width="4" height="1" fill="#38bdf8" opacity="0.6"/>

        <rect x="17" y="29" width="3" height="3" fill="#020617" />
        <rect x="17" y="32" width="4" height="1" fill="#38bdf8" opacity="0.6"/>
      </svg>
    </motion.div>
  );
};
