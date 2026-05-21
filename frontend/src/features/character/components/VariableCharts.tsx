import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { groupGoalsByCategory } from '../utils/characterUtils';

export const VariableCharts: React.FC<{ goals: { category: string }[] }> = ({ goals }) => {
  const data = useMemo(() => groupGoalsByCategory(goals), [goals]);

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const entry = payload[0];
    const color = entry.color || entry.payload?.fill || '#64748b';

    return (
      <div className='bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md'>
        <p className='text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2'>
          Quest Focus
        </p>
        <div className='flex items-center gap-2'>
          <span className='w-2.5 h-2.5 rounded-[2px]' style={{ backgroundColor: color }}></span>
          <span className='text-white font-bold text-xs'>{entry.name}</span>
          <span className='text-slate-500 text-xs font-mono'>{entry.value}</span>
        </div>
      </div>
    );
  };

  return (
    <div className='flex flex-col xl:flex-row items-center justify-center gap-6 w-full'>
      <div className='w-full max-w-[180px] aspect-square relative shrink-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data.length ? data : [{ name: 'Empty', value: 1 }]}
              cx='50%'
              cy='50%'
              innerRadius='65%'
              outerRadius='90%'
              paddingAngle={8}
              dataKey='value'
              stroke='none'
              cornerRadius={4}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing='ease-out'
            >
              {data.length > 0 ? (
                data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.9} />
                ))
              ) : (
                <Cell fill='#1e293b' />
              )}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={false} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className='absolute inset-0 flex items-center justify-center flex-col pointer-events-none'>
          <span className='text-2xl font-bold text-white leading-none font-mono tabular-nums'>
            {goals.length}
          </span>
          <span className='text-xs font-mono text-slate-500 uppercase mt-1'>Quest</span>
        </div>
      </div>

      <div className='w-full max-w-sm space-y-3'>
        {data.slice(0, 5).map((d, i) => (
          <div key={d.name} className='flex items-center text-xs font-mono w-full'>
            <div
              className='w-2.5 h-2.5 rounded-[2px] shrink-0 mr-3'
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            ></div>
            <span className='text-slate-400 capitalize whitespace-nowrap'>{d.name}</span>
            <div className='flex-1 border-b border-dashed border-slate-700 mx-3 opacity-50 relative top-px'></div>
            <span className='text-white font-bold'>{d.value}</span>
          </div>
        ))}
        {data.length === 0 && (
          <div className='text-xs text-slate-500 text-center font-mono uppercase'>
            Belum Ada Quest
          </div>
        )}
      </div>
    </div>
  );
};
