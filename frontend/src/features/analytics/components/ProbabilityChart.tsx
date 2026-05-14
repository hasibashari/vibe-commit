import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ChartProps {
  difficulty: number;
  alpha: number;
  currentRepetition: number;
}

export const ProbabilityChart: React.FC<ChartProps> = ({ difficulty, alpha, currentRepetition }) => {
  const data = React.useMemo(() => {
    const points = [];
    const maxR = Math.max(currentRepetition * 2, difficulty * 10, 20);
    for (let r = 0; r <= maxR; r += maxR / 40) {
      const p = 1 - Math.exp(-alpha * (r / difficulty));
      points.push({
        repetition: Math.round(r),
        probability: Number((p * 100).toFixed(1)),
      });
    }
    return points;
  }, [difficulty, alpha, currentRepetition]);

  return (
    <div className="h-64 w-full bg-slate-900/30 rounded-lg p-6 border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Oracle Drop Rate / Success Chance</h3>
        <span className="text-[10px] font-mono text-cyan-400 opacity-60">Magic Boost Active</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis 
            dataKey="repetition" 
            stroke="rgba(255,255,255,0.2)" 
            fontSize={9}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.2)" 
            fontSize={9}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
            itemStyle={{ color: '#06b6d4', fontSize: '11px', fontFamily: 'monospace' }}
            labelStyle={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '10px', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="probability" 
            stroke="#06b6d4" 
            fillOpacity={1} 
            fill="url(#colorProb)" 
            strokeWidth={1.5}
          />
          <Line
            type="monotone"
            dataKey={() => 100} 
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
