import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const VariableCharts: React.FC<{ goals: { category: string }[] }> = ({ goals }) => {
  const data = React.useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    goals.forEach(g => {
      // Default grouping if category is missing
      const cat = g.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [goals]);

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6'];

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full">
      <div className="w-full max-w-[180px] aspect-square relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
             <Pie
               data={data.length ? data : [{ name: 'Empty', value: 1 }]}
               cx="50%"
               cy="50%"
               innerRadius="65%"
               outerRadius="90%"
               paddingAngle={8}
               dataKey="value"
               stroke="none"
               cornerRadius={4}
             >
               {data.length > 0 ? data.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.9} />
               )) : <Cell fill="#1e293b" />}
             </Pie>
             <Tooltip 
               contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
               itemStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#fff' }}
               cursor={false}
             />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <span className="text-2xl font-bold text-white leading-none font-mono tabular-nums">{goals.length}</span>
          <span className="text-[10px] font-mono text-slate-500 uppercase mt-1">Quest</span>
        </div>
      </div>
      
      <div className="w-full max-w-sm space-y-3">
         {data.slice(0, 5).map((d, i) => (
           <div key={d.name} className="flex justify-between items-center text-[11px] font-mono">
             <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-[2px] shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
               <span className="text-slate-400 truncate w-32 md:w-40 capitalize">{d.name}</span>
             </div>
             <span className="text-white font-bold">{d.value}</span>
           </div>
         ))}
         {data.length === 0 && (
           <div className="text-[11px] text-slate-500 text-center font-mono uppercase">Belum Ada Quest</div>
         )}
      </div>
    </div>
  )
}
