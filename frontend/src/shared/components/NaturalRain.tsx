import React, { useMemo } from 'react';
import { motion } from 'motion/react';

const useMemoizedParticles = (count: number) => {
  return useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 10 + Math.random() * 20,
      delay: -Math.random() * 20,
      size: Math.random() * 0.5 + 0.5,
    }));
  }, [count]);
};

export const NaturalRain: React.FC = () => {
  const drops = useMemoizedParticles(50);
  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none opacity-60 z-10'>
      {drops.map((p, i) => (
        <motion.div
          key={i}
          className='absolute w-[2px] bg-gradient-to-b from-transparent via-white/50 to-transparent rounded-full'
          style={{
            left: `${p.x}%`,
            height: `${5 + p.size * 10}vh`,
          }}
          animate={{
            y: ['-20vh', '120vh'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration * 0.05,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
      <motion.div
        className='absolute inset-0 bg-white mix-blend-overlay pointer-events-none'
        animate={{ opacity: [0, 0, 0, 0.2, 0, 0, 0, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          times: [0, 0.4, 0.41, 0.42, 0.43, 0.44, 0.8, 1],
        }}
      />
    </div>
  );
};
