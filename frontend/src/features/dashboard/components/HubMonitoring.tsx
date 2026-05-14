import React from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, BarChart2, CheckCircle2, Zap, Target } from 'lucide-react';
import { LifeCommitHeatmap } from '../../analytics/components/LifeCommitHeatmap';
import { GlobalProbabilityTrend } from './GlobalProbabilityTrend';
import { VariableCharts } from '../../character/components/VariableCharts';
import type { Goal } from '../../../app/App';

interface HubMonitoringProps {
  goals: Goal[];
}

export function HubMonitoring({ goals }: HubMonitoringProps) {
  const allLogs = goals.flatMap(g => g.logs || []);
  const totalCompleted = goals.reduce((acc, g) => acc + g.repetition_count, 0);
  
  // Calculate basic stats
  const activeExp = goals.reduce((acc, g) => acc + (g.repetition_count > 0 ? (g.difficulty * 10) : 0), 0);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 h-full pb-6 min-w-0"
    >
      <div className="flex flex-col gap-1 mb-2">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
          Command Hub
        </h3>
        <p className="text-xs md:text-sm text-slate-400">Monitoring global progress dan statistik aktivitas.</p>
      </div>

      {goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 md:py-20 text-center px-4">
          <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mb-4 border border-slate-800">
            <Activity className="w-8 h-8 text-slate-600" />
          </div>
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Belum Ada Data</h4>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-6">
            Command Hub akan menampilkan analisis statistik, heatmap konsistensi, dan pergerakan peluangmu setelah kamu mulai mengerjakan Quest.
          </p>
          <div className="text-[10px] font-mono text-cyan-500/70 py-2 px-4 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            Awaiting Initialization...
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            <div className="bg-slate-900/30 p-3 md:p-4 rounded-lg border border-slate-800/60">
              <p className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Selesai
              </p>
              <p className="text-lg md:text-2xl font-mono text-white tabular-nums">{totalCompleted}</p>
            </div>
            <div className="bg-slate-900/30 p-3 md:p-4 rounded-lg border border-slate-800/60">
              <p className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Total EXP
              </p>
              <p className="text-lg md:text-2xl font-mono text-amber-500 tabular-nums">{activeExp}</p>
            </div>
            <div className="bg-slate-900/30 p-3 md:p-4 rounded-lg border border-slate-800/60">
              <p className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1 leading-tight">
                <Target className="w-3 h-3 text-emerald-500 shrink-0" /> Aktif
              </p>
              <p className="text-lg md:text-2xl font-mono text-emerald-400 tabular-nums">{goals.filter(g => g.repetition_count > 0).length}</p>
            </div>
            <div className="bg-slate-900/30 p-3 md:p-4 rounded-lg border border-slate-800/60">
              <p className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1 leading-tight">
                <BarChart2 className="w-3 h-3 text-purple-500 shrink-0" /> Diambil
              </p>
              <p className="text-lg md:text-2xl font-mono text-purple-400 tabular-nums">{goals.length}</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:gap-8 mt-4 pt-6 border-t border-slate-800/50 min-w-0">
            {/* Global Probability Shift */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="px-1">
                <h4 className="text-[11px] font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2 mb-1.5">
                  <Activity className="w-4 h-4 text-emerald-500" /> System Probability Shift
                </h4>
                <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
                  Pergerakan asimtotik peluang optimal (max 99%).
                </p>
              </div>
              <GlobalProbabilityTrend goals={goals} />
            </div>

            {/* Consistency Heatmap */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="px-1">
                <h4 className="text-[11px] font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-500" /> Global Consistency
                </h4>
                 <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
                  Riwayat aktivitas 90 hari terakhir.
                </p>
              </div>
              <LifeCommitHeatmap logs={allLogs} />
            </div>

            {/* Quest Focus Distribution */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="px-1">
                <h4 className="text-[11px] font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2 mb-1.5">
                  <BarChart2 className="w-4 h-4 text-purple-500" /> Quest Focus Distribution
                </h4>
                 <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
                  Distribusi area fokus saat ini.
                </p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 md:p-5">
                <VariableCharts goals={goals} />
              </div>
            </div>
          </div>
        </>
      )}
      
    </motion.div>
  );
}
