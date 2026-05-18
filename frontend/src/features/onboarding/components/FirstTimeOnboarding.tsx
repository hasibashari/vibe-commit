import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, BrainCircuit, Target, ArrowRight, ArrowLeft, Zap, Stars, Fingerprint } from 'lucide-react';

interface FirstTimeOnboardingProps {
  onComplete?: () => void;
  onLogin?: () => void;
  showLoginStep?: boolean;
  initialStep?: number;
}

export function FirstTimeOnboarding({ onComplete, onLogin, showLoginStep = false, initialStep = 0 }: FirstTimeOnboardingProps) {
  const [step, setStep] = useState(initialStep);
  const [isTyping, setIsTyping] = useState(true);

  const baseSteps = [
    {
      title: "SYSTEM AWAKENING",
      text: "Selamat datang di Nexus. Ini bukan sekadar to-do list biasa, ini adalah sistem pelacak progres hidupmu yang dirancang layaknya RPG.",
      icon: <Zap className="w-12 h-12 text-accent-400 mb-4 drop-shadow-lg" />,
      highlight: "RPG"
    },
    {
      title: "BRAIN DUMP & AI QUESTS",
      text: "Pikiranmu sedang kacau? Gunakan fitur Brain Dump. AI akan menganalisis tulisanmu, mengukur tingkat stres, dan menyusunnya menjadi Quest yang bisa dikerjakan.",
      icon: <BrainCircuit className="w-12 h-12 text-emerald-400 mb-4 drop-shadow-lg" />,
      highlight: "Brain Dump"
    },
    {
      title: "STATUS & BURN OUT",
      text: "Selesaikan Quest untuk mendapatkan EXP dan naik level. Tapi hati-hati, memaksakan diri tanpa istirahat akan mengurangi HP (Stamina) dan memicu Burnout.",
      icon: <Shield className="w-12 h-12 text-rose-400 mb-4 drop-shadow-lg" />,
      highlight: "Burnout"
    },
    {
      title: "YOUR JOURNEY BEGINS",
      text: "Status awalmu telah dikalibrasi. Buka Hub, tambahkan Quest pertamamu, dan mulai tingkatkan rank-mu hari ini.",
      icon: <Target className="w-12 h-12 text-indigo-400 mb-4 drop-shadow-lg" />,
      highlight: "Journey"
    }
  ];

  const steps = showLoginStep 
    ? [
        ...baseSteps,
        {
          title: "IDENTIFICATION",
          text: "Otentikasi dibutuhkan untuk mengakses Nexus Dashboard dan menyinkronkan progres ke neural cloud.",
          icon: <Fingerprint className="w-12 h-12 text-blue-400 mb-4 drop-shadow-lg" />,
          highlight: "Otentikasi",
          isLogin: true
        }
      ]
    : baseSteps;

  useEffect(() => {
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 800);
    return () => clearTimeout(t);
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    } else if (step === steps.length - 1 && initialStep === steps.length - 1) {
        // if started exactly on login, no back possible
    }
  };

  const isCurrentLogin = (steps[step] as any).isLogin;

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-[#0A0C10] text-accent-400 p-6 flex-col overflow-hidden font-sans relative">
      {/* Background visual effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
        <div className="w-[800px] h-[800px] bg-gradient-to-tr from-accent-900/10 via-transparent to-rose-900/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm sm:max-w-md md:max-w-lg relative z-20 flex flex-col items-center"
      >
        <div className="text-4xl sm:text-5xl font-black mb-10 text-center text-white relative z-30 drop-shadow-md">Vibe<span className="text-accent-500">Commit</span></div>

        <div className="w-full relative overflow-hidden flex flex-col items-center min-h-[350px] sm:min-h-[300px]">
        
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center w-full absolute inset-0"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="mb-6 flex justify-center items-center h-16"
              >
                {steps[step].icon}
              </motion.div>
              
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase mb-4 h-14 flex items-center justify-center">
                {steps[step].title}
              </h2>
              
              <p className="text-sm sm:text-base font-mono text-slate-400 w-full text-center mb-8 px-2 sm:px-6">
                {steps[step].text.split(' ').map((word, i) => (
                  <span key={i} className={steps[step].highlight.includes(word.replace(/[^a-zA-Z]/g, '')) ? 'text-accent-300 font-bold' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stepper & Action */}
        <div className="flex flex-col items-center w-full mt-auto relative z-20">
          <div className="flex gap-2 mb-8">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === step 
                    ? 'bg-accent-500 w-6 shadow-[0_0_8px_rgba(var(--theme-500-rgb),0.8)]' 
                    : i < step ? 'bg-accent-900' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-4">
            <div className="flex w-full gap-3 justify-center items-center">
              {step > 0 && initialStep !== step && (
                 <button
                   onClick={handleBack}
                   className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all rounded outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-[#0A0C10] flex shrink-0 items-center justify-center"
                   aria-label="Kembali"
                 >
                   <ArrowLeft className="w-5 h-5" />
                 </button>
              )}
              {isCurrentLogin ? (
                <button 
                  onClick={onLogin}
                  className={`flex-1 py-3 bg-accent-500 hover:bg-accent-400 text-[#0f1115] font-bold tracking-widest uppercase transition-all rounded outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-[#0A0C10] flex items-center justify-center gap-2`}
                >
                   <Fingerprint className="w-4 h-4 text-[#0f1115]" /> Sign In with Google
                </button>
              ) : (
                <button 
                  onClick={handleNext}
                  disabled={isTyping}
                  className={`flex-1 py-3 bg-accent-500 hover:bg-accent-400 text-[#0f1115] font-bold tracking-widest uppercase transition-all rounded outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-[#0A0C10] flex items-center justify-center gap-2`}
                >
                    {step === steps.length - 1 ? (
                      <><Stars className="w-4 h-4 text-[#0f1115]" /> Mulai Petualangan</>
                    ) : (
                      <>Selanjutnya <ArrowRight className="w-4 h-4 text-[#0f1115]" /></>
                    )}
                </button>
              )}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
