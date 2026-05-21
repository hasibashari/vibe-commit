import React from 'react';

interface HeatmapProps {
  logs: { timestamp: string }[];
}

export const LifeCommitHeatmap: React.FC<HeatmapProps> = ({ logs }) => {
  const data = React.useMemo(() => {
    // Generate ~90 days of data (approx 3 months for a minimal view)
    const days = 90;
    const heat = new Array(days).fill(0);

    // Map logs to the last 90 days
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    logs.forEach(log => {
      const d = new Date(log.timestamp);
      d.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(now.getTime() - d.getTime());
      // Math.floor (not ceil): a log at 10:00 AM today has a 10-hour diff vs midnight,
      // which is 0.41 days \u2014 floor gives 0 (today), ceil would give 1 (yesterday).
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < days) {
        heat[days - 1 - diffDays]++; // newer days are towards the end
      }
    });

    return heat;
  }, [logs]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-800/30 border border-slate-800/80';
    if (count === 1)
      return 'bg-emerald-900 border border-emerald-800/50 shadow-[0_0_8px_rgba(6,78,59,0.3)]';
    if (count === 2)
      return 'bg-emerald-700 border border-emerald-600/50 shadow-[0_0_10px_rgba(4,120,87,0.4)]';
    if (count === 3)
      return 'bg-emerald-500 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
    return 'bg-emerald-400 border border-emerald-300/50 shadow-[0_0_15px_rgba(52,211,153,0.6)]';
  };

  return (
    <div className='w-full bg-slate-900/50 border border-slate-800 rounded-lg p-4 md:p-6 overflow-hidden'>
      <div className='grid grid-rows-7 grid-flow-col gap-[3px] overflow-x-auto pb-4 custom-scrollbar'>
        {data.map((count, i) => (
          <div
            key={i}
            className={`w-[11px] h-[11px] rounded-[2px] transition-colors duration-500 ${getColor(count)}`}
            title={`Commits: ${count}`}
          />
        ))}
      </div>
      <div className='mt-2 flex items-center justify-end gap-2 text-xs font-mono text-slate-500 uppercase'>
        <span>Kosong</span>
        <div className='w-[11px] h-[11px] rounded-[2px] bg-slate-800/30 border border-slate-800/80'></div>
        <div className='w-[11px] h-[11px] rounded-[2px] bg-emerald-900 border border-emerald-800/50'></div>
        <div className='w-[11px] h-[11px] rounded-[2px] bg-emerald-700 border border-emerald-600/50'></div>
        <div className='w-[11px] h-[11px] rounded-[2px] bg-emerald-500 border border-emerald-400/50'></div>
        <div className='w-[11px] h-[11px] rounded-[2px] bg-emerald-400 border border-emerald-300/50'></div>
        <span>Padat</span>
      </div>
    </div>
  );
};
