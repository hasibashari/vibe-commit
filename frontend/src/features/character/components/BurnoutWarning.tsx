import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { BurnoutPrediction } from '../../../shared/services/analyticsService';

interface BurnoutWarningProps {
  burnoutMonitor: BurnoutPrediction | null;
}

export function BurnoutWarning({ burnoutMonitor }: BurnoutWarningProps) {
  if (!burnoutMonitor?.isBurnedOut) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-rose-950/20 border border-rose-500/30 p-5 rounded-lg flex flex-col gap-3"
    >
      <div className="flex items-center gap-2 text-rose-500 border-b border-rose-500/20 pb-2">
        <AlertTriangle className="w-4 h-4 animate-pulse" />
        <h3 className="text-xs font-bold uppercase tracking-widest">Sistem Warning: Burnout!</h3>
      </div>
      <p className="text-xs text-rose-200/80 leading-relaxed font-mono">
        {burnoutMonitor.refactoringMessage}
      </p>
      
      <div className="mt-2 space-y-2">
        <h4 className="text-xs text-rose-400 font-bold uppercase tracking-widest">Wajib Side-Quest Recovery:</h4>
        {burnoutMonitor.sideQuests?.map((sq, i) => (
          <div key={i} className="bg-rose-900/10 border border-rose-500/20 p-2 rounded text-xs flex gap-2 items-start">
            <span className="text-rose-500 mt-0.5">•</span>
            <div>
              <span className="font-bold text-rose-300 block">{sq.title}</span>
              <span className="text-rose-200/60 leading-tight">{sq.description}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 bg-slate-900/50 p-2 rounded border border-slate-700/50">
        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Arahan Sistem AI</h4>
        <p className="text-xs text-slate-300 font-mono italic">"{burnoutMonitor.adjustments}"</p>
      </div>
    </motion.div>
  );
}
