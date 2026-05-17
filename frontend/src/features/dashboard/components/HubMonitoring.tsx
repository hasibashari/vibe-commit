import React from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, BarChart2, CheckCircle2, Zap, Target } from 'lucide-react';
import { LifeCommitHeatmap } from '../../analytics/components/LifeCommitHeatmap';
import { GlobalProbabilityTrend } from './GlobalProbabilityTrend';
import { VariableCharts } from '../../character/components/VariableCharts';
import type { Goal } from '../../../shared/types/goal';
import { EmptyState } from '../../../shared/components/EmptyState';
import { StatCard } from '../../../shared/components/StatCard';
import { Badge } from '../../../shared/components/Badge';

interface HubMonitoringProps {
  goals: Goal[];
}

export function HubMonitoring({ goals }: HubMonitoringProps) {
  const { allLogs, totalCompleted, activeExp, completedTodayCount } = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let completedToday = 0;
    
    goals.forEach(goal => {
      const hasLogToday = (goal.logs || []).some(log => {
        if (!log.timestamp) return false;
        const logDateStr = typeof log.timestamp === 'string' ? log.timestamp.split('T')[0].split(' ')[0] : '';
        return logDateStr === todayStr;
      });
      if (hasLogToday) completedToday++;
    });

    return {
      allLogs: goals.flatMap(g => g.logs || []),
      totalCompleted: goals.reduce((acc, g) => acc + g.repetition_count, 0),
      activeExp: Math.floor(goals.reduce((acc, g) => acc + (g.repetition_count > 0 ? (g.difficulty * 10 * g.reward_alpha) : 0), 0)),
      completedTodayCount: completedToday
    };
  }, [goals]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="@container flex flex-col gap-6 h-full pb-6 min-w-0"
    >
      <div className="flex flex-col gap-1 mb-2">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent-400" />
          Command Hub
        </h3>
        <p className="text-xs md:text-sm text-slate-400">Monitoring global progress dan statistik aktivitas.</p>
      </div>

      {goals.length === 0 ? (
        <EmptyState 
          icon={<Activity className="w-8 h-8" />}
          title="Belum Ada Data"
          description="Command Hub akan menampilkan analisis statistik, heatmap konsistensi, dan pergerakan peluangmu setelah kamu mulai mengerjakan Quest."
          action={<Badge variant="info">Awaiting Initialization...</Badge>}
          className="flex-1 py-12 md:py-20"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 @[600px]:grid-cols-4 gap-2 md:gap-4">
            <StatCard 
              icon={<CheckCircle2 className="w-4 h-4 text-slate-400" />}
              label="Selesai"
              value={totalCompleted}
            />
            <StatCard 
              icon={<Zap className="w-4 h-4 text-amber-500" />}
              label="Total EXP"
              value={activeExp}
              valueColor="text-amber-500"
            />
            <StatCard 
              icon={<Target className="w-4 h-4 text-emerald-500" />}
              label="Sisa Quest"
              value={Math.max(0, goals.length - completedTodayCount)}
              valueColor="text-emerald-400"
            />
            <StatCard 
              icon={<BarChart2 className="w-4 h-4 text-purple-500" />}
              label="Diambil"
              value={goals.length}
              valueColor="text-purple-400"
            />
          </div>

          <div className="flex flex-col gap-6 md:gap-8 mt-4 pt-6 border-t border-slate-800/50 min-w-0">
            {/* Global Probability Shift */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="px-1">
                <h4 className="text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2 mb-1.5">
                  <Activity className="w-4 h-4 text-emerald-500" /> System Probability Shift
                </h4>
                <p className="text-xs font-mono text-slate-500 leading-relaxed">
                  Pergerakan asimtotik peluang optimal (max 99%).
                </p>
              </div>
              <GlobalProbabilityTrend goals={goals} />
            </div>

            {/* Consistency Heatmap */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="px-1">
                <h4 className="text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-accent-500" /> Global Consistency
                </h4>
                 <p className="text-xs font-mono text-slate-500 leading-relaxed">
                  Riwayat aktivitas 90 hari terakhir.
                </p>
              </div>
              <LifeCommitHeatmap logs={allLogs} />
            </div>

            {/* Quest Focus Distribution */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="px-1">
                <h4 className="text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2 mb-1.5">
                  <BarChart2 className="w-4 h-4 text-purple-500" /> Quest Focus Distribution
                </h4>
                 <p className="text-xs font-mono text-slate-500 leading-relaxed">
                  Distribusi area fokus saat ini.
                </p>
              </div>
              <VariableCharts goals={goals} />
            </div>
          </div>
        </>
      )}
      
    </motion.div>
  );
}
