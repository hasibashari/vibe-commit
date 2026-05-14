import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpPopupRendererProps {
  popups: { id: string; exp: number }[];
}

export function ExpPopupRenderer({ popups }: ExpPopupRendererProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      <AnimatePresence>
        {popups.map(popup => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: -100 }}
            exit={{ opacity: 0, scale: 1.5, y: -200 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute flex items-center gap-3 drop-shadow-[0_0_30px_rgba(52,211,153,0.8)]"
          >
            <div 
              className="text-5xl font-black text-emerald-400 tracking-tighter uppercase tabular-nums stroke-black" 
              style={{ WebkitTextStroke: "2px #022c22" }}
            >
              +{popup.exp} EXP
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
