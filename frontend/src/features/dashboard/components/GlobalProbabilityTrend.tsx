import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Goal } from '../../../shared/types/goal';

interface GlobalProbabilityTrendProps {
  goals: Goal[];
}

export function GlobalProbabilityTrend({ goals }: GlobalProbabilityTrendProps) {
  // Calculate daily momentum/probability shift over the last 30 days
  const data = useMemo(() => {
    const days = 30;
    const points = [];
    const now = new Date();
    now.setHours(23, 59, 59, 999); // end of today

    // Gather all logs and their timestamps
    const allLogs = goals.flatMap(g => 
      (g.logs || []).map(log => ({
        timestamp: new Date(log.timestamp).getTime(),
        weight: g.difficulty * 0.1 // Just a simple weight 
      }))
    );

    // Baseline probability is never absolute zero (setting a 1% floor)
    let currentProbability = 1.0;
    
    // Sort logs chronologically to replay the history, but we only want the last 30 days of points
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
      
      const dayLogs = allLogs.filter(log => log.timestamp >= dayStart.getTime() && log.timestamp <= dayEnd.getTime());
      
      // Calculate daily shift
      if (dayLogs.length > 0) {
        const totalWeight = dayLogs.reduce((acc, log) => acc + log.weight, 0);
        // Respond faster to momentum: growth is proportionally scaled
        const growth = totalWeight * 15;
        currentProbability = Math.min(99.0, currentProbability + growth * ((100.0 - currentProbability) / 100));
      } else {
        // Decay towards baseline 1%
        if (currentProbability > 1.0) {
          // Decay faster at the top, slower at the bottom
          const decay = Math.max(0.5, (currentProbability - 1.0) * 0.15); 
          currentProbability = Math.max(1.0, currentProbability - decay);
        }
      }

      points.push({
        day: dayStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        probability: Number(currentProbability.toFixed(1)),
      });
    }

    return points;
  }, [goals]);

  return (
    <div className="h-48 sm:h-56 md:h-64 w-full bg-slate-900/40 rounded-lg p-2 sm:p-4 md:p-6 border border-slate-800 min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%" className="min-w-0">
        <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProbGlobal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis 
            dataKey="day" 
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
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
            itemStyle={{ color: '#10b981', fontSize: '11px', fontFamily: 'monospace' }}
            labelStyle={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '10px', marginBottom: '4px' }}
          />
          
          <ReferenceLine y={99} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <ReferenceLine y={1} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          
          <Area 
            type="monotone" 
            dataKey="probability" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorProbGlobal)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
