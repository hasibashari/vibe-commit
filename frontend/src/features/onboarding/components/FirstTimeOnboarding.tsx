import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, BrainCircuit, Target, ArrowRight, Zap, Stars } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

interface FirstTimeOnboardingProps {
  onComplete: () => void;
}

export function FirstTimeOnboarding({ onComplete }: FirstTimeOnboardingProps) {
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const steps = [
    {
      title: "SYSTEM AWAKENING",
      text: "Selamat datang di Nexus. Ini bukan sekadar to-do list biasa, ini adalah sistem pelacak progres hidupmu yang dirancang layaknya RPG.",
      icon: <Zap className="w-12 h-12 text-cyan-400 mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />,
      highlight: "RPG"
    },
    {
      title: "BRAIN DUMP & AI QUESTS",
      text: "Pikiranmu sedang kacau? Gunakan fitur Brain Dump. AI akan menganalisis tulisanmu, mengukur tingkat stres, dan menyusunnya menjadi Quest yang bisa dikerjakan.",
      icon: <BrainCircuit className="w-12 h-12 text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]" />,
      highlight: "Brain Dump"
    },
    {
      title: "STATUS & BURN OUT",
      text: "Selesaikan Quest untuk mendapatkan EXP dan naik level. Tapi hati-hati, memaksakan diri tanpa istirahat akan mengurangi HP (Stamina) dan memicu Burnout.",
      icon: <Shield className="w-12 h-12 text-rose-400 mb-4 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" />,
      highlight: "Burnout"
    },
    {
      title: "YOUR JOURNEY BEGINS",
      text: "Status awalmu telah dikalibrasi. Buka Hub, tambahkan Quest pertamamu, dan mulai tingkatkan rank-mu hari ini.",
      icon: <Target className="w-12 h-12 text-indigo-400 mb-4 drop-shadow-[0_0_15px_rgba(129,140,248,0.6)]" />,
      highlight: "Journey"
    }
  ];

  // Auto typing effect for text could be added, but for now simple fade is cleaner and less annoying.
  useEffect(() => {
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 800);
    return () => clearTimeout(t);
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      // Finish onboarding
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-[#0A0C10]/95 backdrop-blur-xl overflow-hidden font-sans">
      {/* Background visual effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-gradient-to-tr from-cyan-900/20 via-transparent to-rose-900/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/80 border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_1px_rgba(255,255,255,0.1)] rounded-2xl p-8 sm:p-10 relative overflow-hidden">
           
           {/* Decorative corner borders */}
           <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-xl"></div>
           <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-xl"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-xl"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 rounded-br-xl"></div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center mt-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              >
                {steps[step].icon}
              </motion.div>
              
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-widest uppercase mb-4 mt-2">
                {steps[step].title}
              </h2>
              
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 min-h-[80px]">
                {steps[step].text.split(' ').map((word, i) => (
                  <span key={i} className={steps[step].highlight.includes(word.replace(/[^a-zA-Z]/g, '')) ? 'text-cyan-300 font-semibold' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Stepper & Action */}
          <div className="flex flex-col items-center gap-8 mt-4">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === step 
                      ? 'bg-cyan-400 w-6 shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                      : i < step ? 'bg-cyan-900' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <div className="w-full flex flex-col gap-3">
              <Button 
                variant="primary"
                onClick={handleNext}
                disabled={isTyping}
                className="w-full py-4 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-white opacity-20 -translate-y-4 group-hover:animate-scanline"></div>

                <span className="relative flex items-center gap-2">
                  {step === steps.length - 1 ? (
                    <><Stars className="w-4 h-4 text-amber-400" /> Mulai Petualangan</>
                  ) : (
                    <>Selanjutnya <ArrowRight className="w-4 h-4 text-cyan-400" /></>
                  )}
                </span>
              </Button>

              {/* Skip Option */}
              {step < steps.length - 1 && (
                <Button 
                  variant="ghost"
                  onClick={onComplete}
                  className="text-slate-500 hover:text-slate-300 text-sm"
                >
                  Skip Tutorial
                </Button>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
