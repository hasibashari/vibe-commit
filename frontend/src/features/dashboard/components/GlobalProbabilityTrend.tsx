import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { Goal } from '../../../shared/types/goal';
import { generateGlobalTimeSeriesData } from '../../../shared/utils/vibeMath';

interface GlobalProbabilityTrendProps {
  goals: Goal[];
}

export function GlobalProbabilityTrend({ goals }: GlobalProbabilityTrendProps) {
  const [filter, setFilter] = useState<'30days' | '90days' | 'this_year' | 'all'>('30days');

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (filter === '30days') {
      start.setDate(end.getDate() - 30);
    } else if (filter === '90days') {
      start.setDate(end.getDate() - 90);
    } else if (filter === 'this_year') {
      start.setFullYear(end.getFullYear(), 0, 1);
    } else if (filter === 'all') {
      const allDates = [
        ...goals.flatMap(g => g.logs || []).map(l => new Date(l.timestamp).getTime()),
        ...goals.filter(g => g.createdAt).map(g => new Date(g.createdAt!).getTime()),
      ];
      if (allDates.length > 0) {
        const firstDate = new Date(Math.min(...allDates));
        start.setTime(firstDate.getTime());
        const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays < 30) {
          start.setDate(end.getDate() - 30);
        }
      } else {
        start.setDate(end.getDate() - 30);
      }
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [filter, goals]);

  const chartData = useMemo(() => {
    const goalsData = goals.map(g => ({
      logs: g.logs || [],
      difficulty: g.difficulty,
      createdAt: g.createdAt,
    }));
    return generateGlobalTimeSeriesData(goalsData, startDate, endDate);
  }, [goals, startDate, endDate]);

  const latestProb = chartData.length > 0 ? chartData[chartData.length - 1].prob : 0;

  const color =
    latestProb >= 75
      ? '#10b981'
      : latestProb >= 45
        ? '#f59e0b'
        : latestProb >= 20
          ? '#f97316'
          : '#f43f5e';

  const formatXAxis = (tickItem: string) => {
    // CRITICAL: new Date('2026-05-21') parses as UTC midnight, which shifts the
    // displayed date back by one day for UTC+ timezones (e.g. Indonesia UTC+7).
    // Appending 'T00:00:00' forces local-time parsing in all browsers.
    const date = new Date(tickItem + 'T00:00:00');
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md'>
          <p className='text-slate-400 text-xs mb-2 font-mono'>
            {new Date(label + 'T00:00:00').toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <div className='flex items-center gap-2 mb-1'>
            <span className='w-3 h-3 rounded-full' style={{ backgroundColor: color }}></span>
            <span className='text-white font-bold'>Distribusi Peluang: {data.prob}%</span>
          </div>
          <p className='text-slate-500 text-xs tabular-nums'>Total Quest Selesai: {data.reps}x</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='w-full flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex bg-slate-900/50 rounded-lg p-1 border border-slate-800'>
          {[
            { id: '30days', label: '30 Hari' },
            { id: '90days', label: '3 Bulan' },
            { id: 'this_year', label: 'Tahun Ini' },
            { id: 'all', label: 'Semua' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1 text-[10px] sm:text-xs font-mono rounded-md transition-colors ${
                filter === f.id
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className='h-48 sm:h-56 md:h-64 w-full bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 pt-6'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id='consistencyAreaFill' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={color} stopOpacity={0.35} />
                <stop offset='95%' stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey='date'
              tickFormatter={formatXAxis}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={val => `${val}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />

            <ReferenceLine y={100} stroke='#334155' strokeDasharray='3 3' opacity={0.5} />
            <ReferenceLine y={50} stroke='#334155' strokeDasharray='3 3' opacity={0.5} />
            <ReferenceLine y={0} stroke='#334155' strokeDasharray='3 3' opacity={0.5} />

            <Area
              type='monotone'
              dataKey='prob'
              stroke={color}
              strokeWidth={3}
              fill='url(#consistencyAreaFill)'
              activeDot={{ r: 6, fill: color, stroke: '#0f172a', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing='ease-out'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className='text-[10px] text-slate-500 font-mono text-center'>
        Naik saat quest selesai · Turun perlahan saat absen (Model Beta-Bernoulli).
      </p>
    </div>
  );
}
