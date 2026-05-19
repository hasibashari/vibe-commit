import { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { motion } from 'motion/react';

interface BrainDumpAnalysisResult {
  analysisSummary: string;
  quests: { category: string }[];
}

interface BrainDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAnalyzing: boolean;
  draftContent: string;
  setDraftContent: (content: string) => void;
  onSubmit: () => void;
  analysisResult?: BrainDumpAnalysisResult;
}

export function BrainDumpModal({
  isOpen,
  onClose,
  isAnalyzing,
  draftContent,
  setDraftContent,
  onSubmit,
  analysisResult,
}: BrainDumpModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} preventBackdropClose={isAnalyzing || !!analysisResult}>
      {analysisResult ? (
        <div className='p-6 sm:p-10 space-y-6 sm:space-y-8 flex flex-col items-center justify-center text-center min-h-[400px]'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <div className='w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto rotate-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]'>
              <CheckCircle2 className='w-10 h-10 text-emerald-400' />
            </div>
          </motion.div>

          <h2 className='font-display text-3xl font-bold tracking-tight text-white'>
            Quests Generated!
          </h2>

          <div className='space-y-4 text-slate-300 max-w-md w-full'>
            <div
              className={`text-lg transition-all duration-300 overflow-hidden ${isExpanded ? '' : 'line-clamp-3'}`}
            >
              <p>{analysisResult.analysisSummary}</p>
            </div>

            {analysisResult.analysisSummary.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className='flex items-center gap-1 mx-auto text-sm text-accent-400 hover:text-accent-300 transition-colors'
              >
                {isExpanded ? (
                  <>
                    Sembunyikan <ChevronUp className='w-4 h-4' />
                  </>
                ) : (
                  <>
                    Baca Selengkapnya <ChevronDown className='w-4 h-4' />
                  </>
                )}
              </button>
            )}
          </div>

          <div className='flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 w-full'>
            {['Main Quest', 'Daily Quest', 'Side Quest'].map(cat => {
              const count = analysisResult.quests.filter(
                (q: { category: string }) => q.category === cat,
              ).length;
              if (count === 0) return null;
              return (
                <div
                  key={cat}
                  className='bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 min-w-[100px] sm:min-w-[120px] flex-1'
                >
                  <div className='text-2xl sm:text-3xl font-black text-accent-400 mb-1'>
                    {count}
                  </div>
                  <div className='text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-500'>
                    {cat}
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant='secondary' onClick={onClose} className='mt-8'>
            Tutup
          </Button>
        </div>
      ) : (
        <div className='p-5 sm:p-8 space-y-4 sm:space-y-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0'>
              <BrainCircuit className='w-6 h-6 text-accent-400' />
            </div>
            <div>
              <h2 className='font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight'>
                AI Quest Generator
              </h2>
              <p className='text-[10px] sm:text-xs text-white/50 font-mono uppercase tracking-wider'>
                Tumpahin pikiran lo, AI yang pecah jadi Quest logis
              </p>
            </div>
          </div>

          <textarea
            value={draftContent}
            onChange={e => setDraftContent(e.target.value)}
            placeholder='Contoh: Akhir-akhir ini badan sering lemes karena jarang olahraga, pengen gym tapi males pergi. Trus aku juga mau cicil baca drakor... eh buku tiap hari sekitar 15 menit...'
            className='w-full h-48 sm:h-64 bg-transparent border border-white/10 rounded-2xl p-4 sm:p-6 focus:outline-none focus:ring-1 focus:ring-accent-500/50 focus:border-accent-500/50 transition-colors resize-none placeholder:text-white/20 font-sans leading-relaxed text-base sm:text-lg text-slate-200'
          />

          <div className='flex justify-between items-center bg-surface -mx-5 -mb-5 sm:-mx-8 sm:-mb-8 p-4 sm:p-6 border-t border-white/5'>
            <Button variant='ghost' disabled={isAnalyzing} onClick={onClose}>
              Batal
            </Button>
            <Button
              variant='primary'
              disabled={isAnalyzing || !draftContent}
              onClick={onSubmit}
              isLoading={isAnalyzing}
              className='rounded-full px-8 gap-2'
            >
              {!isAnalyzing && (
                <>
                  <Sparkles className='w-5 h-5' />
                  Extract Quests
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
