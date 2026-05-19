import React from 'react';
import { motion } from 'motion/react';

export const GroundLayer: React.FC = () => {
  return (
    <div className='absolute bottom-0 left-0 w-full h-[calc(20%+32px)] pointer-events-none z-0'>
      <div className='absolute top-0 w-full h-8 overflow-hidden'>
        <motion.div
          animate={{
            x: [0, -120],
          }}
          transition={{
            repeat: Infinity,
            duration: 15, // Very slow ambient panning
            ease: 'linear',
          }}
          className='flex w-[200vw]'
        >
          {/* We use a repeating block texture setup that feels like an RPG grid */}
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className='flex-none w-[30px] h-8 relative'>
              <div className='absolute top-0 w-full h-[2px] bg-cyan-900/40' />
              <div className='absolute top-[2px] w-[2px] h-full bg-cyan-900/30' />
              <div className='absolute top-[14px] w-full h-px bg-slate-800/50' />
              {i % 3 === 0 && (
                <div className='absolute top-[6px] left-[6px] w-[4px] h-[2px] bg-accent-700/50 rounded' />
              )}
              {i % 5 === 1 && (
                <div className='absolute top-[20px] left-[15px] w-[6px] h-[2px] bg-emerald-700/40 rounded' />
              )}
            </div>
          ))}
        </motion.div>
      </div>
      <div className='absolute top-4 w-full h-full bg-linear-to-b from-slate-900/80 to-slate-950' />
    </div>
  );
};
