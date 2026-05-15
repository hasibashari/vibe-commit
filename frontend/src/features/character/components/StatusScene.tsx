import React, { useState } from 'react';
import { BackgroundLayer } from './BackgroundLayer';
import { GroundLayer } from './GroundLayer';
import { CharacterSprite } from './CharacterSprite';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle } from 'lucide-react';
import { AIChatModal } from './AIChatModal';
import { useDynamicQuotes, useEasterEgg, useTypingEffect } from '../hooks/useStatusScene';

interface StatsProps {
  hp: number;
  mana: number;
  level: number;
  goals?: any[];
  nudge?: { optimalHour: number; suggestion: string } | null;
  userName?: string;
}

export const StatusScene: React.FC<StatsProps> = ({ hp, mana, level, goals, nudge, userName }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { dynamicQuotes, quoteIndex } = useDynamicQuotes(hp, mana, goals, nudge, userName);
  const { overrideQuote, tapCount, handleCharacterTap } = useEasterEgg();
  
  const currentQuote = overrideQuote || dynamicQuotes[quoteIndex];
  const { displayedText, isTyping } = useTypingEffect(currentQuote);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  return (
    <div className="relative -mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full min-h-[450px] aspect-[4/5] sm:aspect-auto sm:min-h-0 sm:h-[400px] md:h-[450px] lg:h-[480px] bg-slate-950 border-y sm:border border-slate-800/60 sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center group isolate">
      <BackgroundLayer />
      <GroundLayer />

      <div className="absolute top-6 left-0 w-full px-6 flex justify-between items-start z-20">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <p className="text-[12px] text-cyan-400 font-mono tracking-widest uppercase mt-1 drop-shadow-md">
              AI Companion
            </p>
          </div>
        </div>
      </div>

      {/* Main Character Scene */}
      <div className="absolute bottom-[calc(10%+8px)] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center scale-90 md:scale-100 origin-bottom">
        {/* Dynamic UI Chat Bubble */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={quoteIndex}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-[85vw] max-w-[280px] sm:max-w-[320px] z-20 group/chat"
          >
            <div className="bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-md border border-cyan-500/30 group-hover/chat:border-cyan-400/50 rounded-2xl p-4 shadow-[0_0_20px_rgba(34,211,238,0.1)] group-hover/chat:shadow-[0_0_25px_rgba(34,211,238,0.2)] relative transition-all duration-300">

              
              <button 
                onClick={(e) => { e.stopPropagation(); handleOpenChat(); }}
                className="absolute -top-3 -right-2 bg-indigo-500 hover:bg-indigo-400 hover:scale-110 transition-all rounded-full p-2 shadow-lg shadow-indigo-500/20 border border-indigo-400/30 animate-pulse z-30 outline-none focus:ring-2 focus:ring-indigo-300"
                title="Chat dengan AI"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </button>

              <p className="text-sm text-slate-200 font-sans text-center leading-relaxed font-medium min-h-[40px] break-words cursor-default mt-1">
                "{displayedText}
                {isTyping && <span className="inline-block w-1 h-3.5 ml-0.5 bg-cyan-400 animate-pulse align-middle"></span>}
                "
              </p>
              {/* Bubble Tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900/80 border-b border-r border-cyan-500/30 group-hover/chat:border-cyan-400/50 transform rotate-45 translate-y-[-1px] backdrop-blur-md transition-all duration-300"></div>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          onClick={handleCharacterTap}
          whileTap={{ scale: 0.95 }}
          animate={tapCount > 20 ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.2 } } : {}}
          className="cursor-pointer group-hover:scale-105 transition-transform duration-300 relative"
          title="Tap aku!"
        >
          <CharacterSprite />
        </motion.div>
      </div>

      <AIChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        user={{ name: userName, hp, mana, level }}
        goals={goals}
      />
    </div>
  );
};
