import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';

interface BrainDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAnalyzing: boolean;
  draftContent: string;
  setDraftContent: (content: string) => void;
  onSubmit: () => void;
  analysisResult?: any;
}

export function BrainDumpModal({
  isOpen,
  onClose,
  isAnalyzing,
  draftContent,
  setDraftContent,
  onSubmit,
  analysisResult
}: BrainDumpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => !isAnalyzing && !analysisResult && onClose()}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {analysisResult ? (
              <div className="p-10 space-y-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto rotate-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                </motion.div>
                
                <h2 className="font-display text-3xl font-bold tracking-tight text-white">Quests Generated!</h2>
                
                <div className="space-y-2 text-slate-300 max-w-md">
                  <p className="text-lg">{analysisResult.analysisSummary}</p>
                </div>

                <div className="flex gap-4 mt-6">
                  {['Main Quest', 'Daily Quest', 'Side Quest'].map(cat => {
                    const count = analysisResult.quests.filter((q: any) => q.category === cat).length;
                    if (count === 0) return null;
                    return (
                      <div key={cat} className="bg-slate-900 border border-slate-800 rounded-lg p-4 min-w-[120px]">
                        <div className="text-3xl font-black text-cyan-400 mb-1">{count}</div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{cat}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">AI Quest Generator</h2>
                  <p className="text-xs text-white/50 font-mono uppercase tracking-wider">Tumpahin pikiran lo, AI yang pecah jadi Quest logis</p>
                </div>
              </div>

              <textarea 
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="Contoh: Akhir-akhir ini badan sering lemes karena jarang olahraga, pengen gym tapi males pergi. Trus aku juga mau cicil baca drakor... eh buku tiap hari sekitar 15 menit..."
                className="w-full h-64 bg-transparent border border-white/10 rounded-2xl p-6 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors resize-none placeholder:text-white/20 font-sans leading-relaxed text-lg"
              />

              <div className="flex justify-between items-center bg-white/5 -mx-8 -mb-8 p-8 border-t border-white/10">
                <button 
                  disabled={isAnalyzing}
                  onClick={onClose}
                  className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-white/30 hover:text-white transition-colors min-h-[44px] -ml-6"
                >
                  Batal
                </button>
                <button 
                  disabled={isAnalyzing || !draftContent}
                  onClick={onSubmit}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 disabled:text-white/30 text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:shadow-none"
                >
                  {isAnalyzing ? (
                    <>
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      Analyzing Signal...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Extract Quests
                    </>
                  )}
                </button>
              </div>
            </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
