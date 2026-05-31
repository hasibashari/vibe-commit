import React from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, BarChart2, CheckCircle2, Zap, Target } from 'lucide-react';
import { LifeCommitHeatmap } from '../../analytics/components/LifeCommitHeatmap';
import { GlobalProbabilityTrend } from './GlobalProbabilityTrend';
import type { Goal } from '../../../shared/types/goal';
import { getTodayLocalString, getLogDateString } from '../../../shared/utils/dateUtils';
import { EmptyState } from '../../../shared/components/EmptyState';
import { StatCard } from '../../../shared/components/StatCard';
import { Badge } from '../../../shared/components/Badge';
import { useDashboardStore } from '../../../store/dashboardStore';

interface HubMonitoringProps {
  goals: Goal[];
}

export function HubMonitoring({ goals }: HubMonitoringProps) {
  const activeGoals = React.useMemo(() => goals.filter(g => g.status !== 'archived'), [goals]);

  const user = useDashboardStore(state => state.user);
  const allLogsFromStore = useDashboardStore(state => state.allLogs);
  const sandboxDateOffset = user?.sandbox_date_offset || 0;

  const { allLogs, totalCompleted, activeExp, completedTodayCount } = React.useMemo(() => {
    // Use local date (not UTC) so "today" is the user's actual calendar day.
    const todayStr = getTodayLocalString(sandboxDateOffset);
    let completedToday = 0;

    activeGoals.forEach(goal => {
      const hasLogToday = (goal.logs || []).some(log => {
        if (!log.timestamp) return false;
        const logDateStr = getLogDateString(log.timestamp);
        return logDateStr === todayStr;
      });
      if (hasLogToday) completedToday++;
    });

    return {
      allLogs: allLogsFromStore.length > 0 ? allLogsFromStore : goals.flatMap(g => g.logs || []),
      totalCompleted: allLogsFromStore.length > 0 
        ? allLogsFromStore.length 
        : goals.reduce((acc, g) => acc + Number(g.repetition_count || 0), 0),
      // FIXED: multiply by repetition_count so we get TOTAL EXP earned across
      // all completions — not just the EXP for a single hypothetical completion.
      // This now matches the actual EXP credited to the user's RPG level.
      activeExp: goals.reduce(
        (acc, g) => acc + Math.floor(g.difficulty * 10 * g.reward_alpha) * Number(g.repetition_count || 0),
        0,
      ),
      completedTodayCount: completedToday,
    };
  }, [goals, activeGoals, allLogsFromStore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='@container flex flex-col gap-6 h-full pb-6 min-w-0'
    >
      <div className='flex flex-col gap-1 mb-2'>
        <h3 className='text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2'>
          <Activity className='w-5 h-5 text-accent-400' />
          Command Hub
        </h3>
        <p className='text-xs md:text-sm text-slate-400'>
          Monitoring global progress dan statistik aktivitas.
        </p>
      </div>

      {goals.length === 0 && allLogs.length === 0 ? (
        <EmptyState
          icon={<Activity className='w-8 h-8' />}
          title='Belum Ada Data'
          description='Command Hub akan menampilkan analisis statistik, heatmap konsistensi, dan pergerakan peluangmu setelah kamu mulai mengerjakan Quest.'
          action={<Badge variant='info'>Awaiting Initialization...</Badge>}
          className='flex-1 py-12 md:py-20'
        />
      ) : (
        <>
          {goals.length === 0 && allLogs.length > 0 && (
            <div className='bg-indigo-950/30 border border-indigo-800/50 rounded-lg p-4 mb-4 flex items-center justify-center gap-3'>
              <Target className='w-5 h-5 text-indigo-500' />
              <p className='text-sm text-indigo-400 font-medium'>
                Belum ada quest aktif saat ini. Tambahkan quest baru untuk memulai!
              </p>
            </div>
          )}
          {activeGoals.length > 0 && completedTodayCount === activeGoals.length && (
            <div className='bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4 mb-4 flex items-center justify-center gap-3'>
              <CheckCircle2 className='w-5 h-5 text-emerald-500' />
              <p className='text-sm text-emerald-400 font-medium'>
                Semua quest telah diselesaikan! Waktunya istirahat atau tambahkan quest baru.
              </p>
            </div>
          )}
          <div className='grid grid-cols-2 @[600px]:grid-cols-4 gap-2 md:gap-4'>
            <StatCard
              icon={<CheckCircle2 className='w-4 h-4 text-slate-400' />}
              label='Selesai'
              value={totalCompleted}
            />
            <StatCard
              icon={<Zap className='w-4 h-4 text-amber-500' />}
              label='Total EXP'
              value={activeExp}
              valueColor='text-amber-500'
            />
            <StatCard
              icon={<Target className='w-4 h-4 text-emerald-500' />}
              label='Sisa Quest'
              value={Math.max(0, activeGoals.length - completedTodayCount)}
              valueColor='text-emerald-400'
            />
            <StatCard
              icon={<BarChart2 className='w-4 h-4 text-purple-500' />}
              label='Diambil'
              value={activeGoals.length}
              valueColor='text-purple-400'
            />
          </div>

          <div className='flex flex-col gap-6 md:gap-8 mt-4 pt-6 border-t border-slate-800/50 min-w-0'>
            {/* Global Consistency Shift */}
            <div className='flex flex-col gap-3 min-w-0'>
              <div className='px-1'>
                <h4 className='text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2 mb-1.5'>
                  <Activity className='w-4 h-4 text-emerald-500' /> System Consistency Shift
                </h4>
                <p className='text-xs font-mono text-slate-500 leading-relaxed'>
                  Distribusi peluang keberhasilan — Menunjukkan seberapa besar peluang kamu berdasarkan aktivitas yang telah dilakukan.
                </p>
              </div>
              <GlobalProbabilityTrend goals={goals} sandboxDateOffset={sandboxDateOffset} />
            </div>

            {/* Consistency Heatmap */}
            <div className='flex flex-col gap-3 min-w-0'>
              <div className='px-1'>
                <h4 className='text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2 mb-1.5'>
                  <TrendingUp className='w-4 h-4 text-accent-500' /> Global Consistency
                </h4>
                <p className='text-xs font-mono text-slate-500 leading-relaxed'>
                  Riwayat aktivitas 90 hari terakhir.
                </p>
              </div>
              <LifeCommitHeatmap logs={allLogs} sandboxDateOffset={sandboxDateOffset} />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
