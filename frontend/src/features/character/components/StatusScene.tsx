import React, { useState, useEffect } from 'react';
import { BackgroundLayer } from './BackgroundLayer';
import { GroundLayer } from './GroundLayer';
import { CharacterSprite } from './CharacterSprite';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle } from 'lucide-react';
import { AIChatModal } from './AIChatModal';

interface StatsProps {
  hp: number;
  mana: number;
  level: number;
  goals?: any[];
  nudge?: { optimalHour: number; suggestion: string } | null;
  userName?: string;
}

export const StatusScene: React.FC<StatsProps> = ({ hp, mana, level, goals, nudge, userName }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Pagi";
    if (hour >= 12 && hour < 15) return "Siang";
    if (hour >= 15 && hour < 18) return "Sore";
    return "Malam";
  };

  const getDynamicQuotes = () => {
    const quotes = [];
    const greeting = getTimeGreeting();
    const namePrefix = userName ? ` ${userName}` : '';
    
    // Default quotes for empty state or freshly reset
    if (!goals || goals.length === 0) {
      quotes.push(`Selamat ${greeting}${namePrefix}! Sistem berada pada kondisi awal. Mari kita mulai mendaftarkan Quest-mu!`);
      quotes.push("Belum ada target yang ditentukan. Coba gunakan fitur Brain Dump di bawah kalau merasa overwhelmed.");
      quotes.push("Siap untuk memulai petualangan baru hari ini? Tambahkan quest di panel sebelah.");
      return quotes;
    }

    // Nudges
    if (nudge && nudge.suggestion) {
      quotes.push(`Insight: ${nudge.suggestion}`);
    }

    const activeGoals = goals.filter(g => g.repetition_count > 0).length;
    
    // Greetings with goals
    if (activeGoals > 0) {
      quotes.push(`Selamat ${greeting}${namePrefix}! Kamu sedang aktif menjalankan ${activeGoals} quest. Let's get things done!`);
    } else {
      quotes.push(`Selamat ${greeting}${namePrefix}! Ada quest utama yang belum disentuh lho. Mau mulai sekarang?`);
    }

    // Status warnings / praises
    if (hp < 50) {
      quotes.push("Warning: Stamina (HP) kamu mulai turun. Mungkin butuh peregangan atau break sebentar?");
    } else if (hp === 100) {
      quotes.push("Stamina penuh 100%! Kamu dalam kondisi puncak untuk mengambil task yang berat.");
    }

    if (mana < 30) {
      quotes.push("Fokus (Mana) hampir habis. Jangan memaksakan diri, risiko burnout meningkat. Waktunya istirahat.");
    } else if (mana > 80) {
      quotes.push("Fokus (Mana) masih sangat tajam. Waktu yang tepat untuk masuk sesi deep work.");
    }

    // Casual encouragements
    quotes.push("Jangan lupa review quest harianmu. Progres kecil setiap hari akan membuahkan hasil besar.");
    quotes.push("Kalau ngerasa stuck, break down quest-nya jadi langkah-langkah yang jauh lebih kecil.");

    return quotes;
  };

  const dynamicQuotes = getDynamicQuotes();
  const validQuoteIndex = quoteIndex % dynamicQuotes.length;

  const [tapCount, setTapCount] = useState(0);
  const [overrideQuote, setOverrideQuote] = useState<string | null>(null);
  const currentQuote = overrideQuote || dynamicQuotes[validQuoteIndex];

  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Auto-cycle quote every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % dynamicQuotes.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [dynamicQuotes.length]);

  // Easter egg logic
  useEffect(() => {
    if (tapCount === 0) return;

    let msg = null;
    if (tapCount === 3) msg = "Eh, kenapa tap-tap?";
    else if (tapCount === 8) msg = "Woi! Jangan di-poke terus, geli tau!";
    else if (tapCount === 15) msg = "Buset dah, lo gabut apa gimana nih?";
    else if (tapCount === 25) msg = "😡 UDAH WOYY! Selesaikan quest lo sana!";

    if (msg) {
      setOverrideQuote(msg);
    }

    const timer = setTimeout(() => {
      setTapCount(0);
      setOverrideQuote(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [tapCount]);

  // Typing effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let i = 0;
    
    setDisplayedText("");
    setIsTyping(true);

    const typeWriter = () => {
      if (i < currentQuote.length) {
        setDisplayedText(currentQuote.slice(0, i + 1));
        i++;
        // Randomize speed slightly for a more natural feel
        const randomSpeed = Math.floor(Math.random() * 30) + 20; 
        timeoutId = setTimeout(typeWriter, randomSpeed);
      } else {
        setIsTyping(false);
      }
    };

    // Small delay before starting to type
    timeoutId = setTimeout(typeWriter, 300);

    return () => clearTimeout(timeoutId);
  }, [currentQuote]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCharacterTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTapCount(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-[500px] md:h-[650px] lg:h-[750px] bg-slate-950 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl mb-6 flex flex-col items-center justify-center group isolate">
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
      <div className="absolute bottom-[calc(10%+8px)] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center scale-90 md:scale-95 lg:scale-[0.8] origin-bottom">
        {/* Dynamic UI Chat Bubble */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={quoteIndex}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-28 left-1/2 -translate-x-1/2 w-72 z-20 group/chat"
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
      />
    </div>
  );
};
