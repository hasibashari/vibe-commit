import React, { useState } from 'react';
import { Settings, X, Unlock, Zap, Coins, Calendar, ArrowLeft, ArrowRight, Clock, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { UserStats } from '../types/user';

export type DevOverrides = {
  anxietyScore: number | null;
  sigmaVariance: number | null;
  themeVibe: string | null;
  unlockAllBadges: boolean;
  unlockAllShop: boolean;
};

type DevSandboxPanelProps = {
  overrides: DevOverrides;
  setOverrides: React.Dispatch<React.SetStateAction<DevOverrides>>;
  user: UserStats;
  sandboxAction: (payload: { hp?: number | null; mana?: number | null; level?: number | null; coins_delta?: number | null; sandbox_date_offset?: number | null }) => Promise<void>;
};

export const DevSandboxPanel: React.FC<DevSandboxPanelProps> = ({ overrides, setOverrides, user, sandboxAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Menyembunyikan opsi Dev Sandbox pada Production Deployment agar tidak bisa diakses
  // sandbox ini di-design hanya untuk testing lokal environment (pengembangan)
  if (import.meta.env.PROD) {
    return null;
  }

  const updateOverride = (key: keyof DevOverrides, value: any) => {
    setOverrides(prev => ({ ...prev, [key]: value }));
  };

  const formatSimulatedDate = (offset: number) => {
    const d = new Date();
    if (offset !== 0) {
      d.setDate(d.getDate() + offset);
    }
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const dayName = days[d.getDay()];
    const dayVal = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    
    return `${dayName}, ${dayVal} ${monthName} ${year}`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-999 w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-md border border-fuchsia-500/30 text-fuchsia-400 flex items-center justify-center hover:bg-slate-800 hover:scale-110 transition-all shadow-[0_0_15px_rgba(217,70,239,0.2)]"
        title="Developer Sandbox"
      >
        <Settings className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-4 z-1000 w-[340px] max-w-[calc(100vw-32px)] bg-slate-900/95 backdrop-blur-xl border border-fuchsia-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-3 border-b border-fuchsia-500/20 bg-fuchsia-500/5">
              <h3 className="text-xs font-bold text-fuchsia-400 flex items-center gap-2">
                <Settings className="w-4 h-4" /> DEVELOPER SANDBOX
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              
              {/* CHRONOS DRIVE (TIME MACHINE) */}
              <div className="space-y-4 border-b border-cyan-500/10 pb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                  <span>Chronos Drive (Time Machine)</span>
                  <span className="text-cyan-400 font-mono">Offset: {user.sandbox_date_offset || 0}d</span>
                </h4>
                
                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-center space-y-1 shadow-[inset_0_0_8px_rgba(6,182,212,0.05)]">
                  <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold flex items-center justify-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> Simulated Time
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    {formatSimulatedDate(user.sandbox_date_offset || 0)}
                  </div>
                  <div className="text-[9px] font-mono flex items-center justify-center gap-1">
                    {user.sandbox_date_offset === undefined || user.sandbox_date_offset === 0 ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Present Day (Live)</span>
                    ) : user.sandbox_date_offset > 0 ? (
                      <span className="text-cyan-400 font-semibold flex items-center gap-0.5">Future (+{user.sandbox_date_offset} {user.sandbox_date_offset === 1 ? 'day' : 'days'})</span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-0.5">Past ({user.sandbox_date_offset} days)</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => sandboxAction({ sandbox_date_offset: (user.sandbox_date_offset || 0) - 1 })}
                    className="flex-1 text-[10px] py-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> -1 Hari
                  </button>
                  <button 
                    onClick={() => sandboxAction({ sandbox_date_offset: (user.sandbox_date_offset || 0) + 1 })}
                    className="flex-1 text-[10px] py-1.5 bg-cyan-500/10 rounded border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 flex items-center justify-center gap-1 font-semibold transition-colors"
                  >
                    +1 Hari <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>-15 Hari</span>
                    <span>Lompat Waktu (Slider)</span>
                    <span>+15 Hari</span>
                  </div>
                  <input 
                    type="range" min="-15" max="15" step="1"
                    value={user.sandbox_date_offset || 0}
                    onChange={(e) => sandboxAction({ sandbox_date_offset: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                  {user.sandbox_date_offset !== 0 && (
                    <button 
                      onClick={() => sandboxAction({ sandbox_date_offset: 0 })}
                      className="w-full text-[10px] py-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 rounded border border-rose-500/30 flex items-center justify-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-3 h-3 animate-[spin_10s_linear_infinite]" /> Reset ke Hari Ini (Real Date)
                    </button>
                  )}
                </div>

                <div className="text-[9px] text-slate-400 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800 font-sans">
                  💡 <strong className="text-slate-300">Rollover Logic:</strong> Maju hari tanpa quest selesai memicu pemotongan <span className="text-rose-400">-15 HP</span> & decay <span className="text-cyan-400">-10 Mana</span>. Selesaikan quest terlebih dahulu untuk melindungi HP!
                </div>
              </div>

              {/* STATS CONTROLLER (Saved to DB) */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                  <span>RPG Character Stats (DB Real)</span>
                  <span className="text-fuchsia-500/70 normal-case">persists</span>
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>HP (Stamina/Energi)</span>
                    <span>{user.hp} / 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" min="0" max="100" 
                      value={user.hp || 0}
                      onChange={(e) => sandboxAction({ hp: parseInt(e.target.value) })}
                      className="w-full accent-fuchsia-500"
                    />
                    <button onClick={() => sandboxAction({ hp: 100 })} className="text-[10px] text-fuchsia-400 px-2 py-1 bg-fuchsia-400/10 rounded">Max</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Mana (Fokus/Energi Mental)</span>
                    <span>{user.mana} / 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" min="0" max="100" 
                      value={user.mana || 0}
                      onChange={(e) => sandboxAction({ mana: parseInt(e.target.value) })}
                      className="w-full accent-fuchsia-500"
                    />
                    <button onClick={() => sandboxAction({ mana: 100 })} className="text-[10px] text-fuchsia-400 px-2 py-1 bg-fuchsia-400/10 rounded">Max</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Tambah Koin (Coins)</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => sandboxAction({ coins_delta: 100 })} className="flex-1 text-[10px] py-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1"><Coins className="w-3 h-3"/> +100</button>
                    <button onClick={() => sandboxAction({ coins_delta: 1000 })} className="flex-1 text-[10px] py-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1"><Coins className="w-3 h-3"/> +1000</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Override Level</span>
                    <span>{`Level ${user.level}`}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => sandboxAction({ level: 1 })} className="flex-1 text-[10px] py-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 text-slate-200">Level 1</button>
                    <button onClick={() => sandboxAction({ level: 10 })} className="flex-1 text-[10px] py-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 text-slate-200">Level 10</button>
                  </div>
                </div>
              </div>

              {/* VIBE ATMOSPHERE OVERRIDE */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vibe Atmosphere (Cuaca & Efek)</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Anxiety Score (Tingkat Kecemasan)</span>
                    <span>{overrides.anxietyScore !== null ? overrides.anxietyScore : 'Default'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" min="1" max="10" 
                      value={overrides.anxietyScore !== null ? overrides.anxietyScore : ''}
                      onChange={(e) => updateOverride('anxietyScore', parseInt(e.target.value))}
                      className="w-full accent-fuchsia-500"
                    />
                    <button onClick={() => updateOverride('anxietyScore', null)} className="text-[10px] text-fuchsia-400 px-2 py-1 bg-fuchsia-400/10 rounded">Reset</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Sigma/Fog (Konsistensi Fokus)</span>
                    <span>{overrides.sigmaVariance !== null ? overrides.sigmaVariance.toFixed(1) : 'Default'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" min="0" max="6" step="0.1"
                      value={overrides.sigmaVariance !== null ? overrides.sigmaVariance : ''}
                      onChange={(e) => updateOverride('sigmaVariance', parseFloat(e.target.value))}
                      className="w-full accent-fuchsia-500"
                    />
                    <button onClick={() => updateOverride('sigmaVariance', null)} className="text-[10px] text-fuchsia-400 px-2 py-1 bg-fuchsia-400/10 rounded">Reset</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Force Tema Lingkungan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      value={overrides.themeVibe || ''} 
                      onChange={(e) => updateOverride('themeVibe', e.target.value || null)}
                      className="flex-1 bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded p-1.5 focus:outline-none focus:border-fuchsia-500/50"
                    >
                      <option value="">-- Default --</option>
                      <option value="midnight">Midnight Dev</option>
                      <option value="emerald">Emerald Forest</option>
                      <option value="neon">Neon City</option>
                      <option value="matrix">Matrix Green</option>
                      <option value="sunset">Retro Sunset</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* QUICK UNLOCKS */}
              <div className="space-y-4 pb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Buka Cepat (Quick Unlocks)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => updateOverride('unlockAllBadges', !overrides.unlockAllBadges)}
                    className={`text-[10px] py-2 rounded border flex flex-col items-center justify-center gap-1 transition-colors ${overrides.unlockAllBadges ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <Zap className="w-4 h-4 mb-0.5" />
                    Buka Lencana (Badges)
                  </button>
                  <button 
                    onClick={() => updateOverride('unlockAllShop', !overrides.unlockAllShop)}
                    className={`text-[10px] py-2 rounded border flex flex-col items-center justify-center gap-1 transition-colors ${overrides.unlockAllShop ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <Unlock className="w-4 h-4 mb-0.5" />
                    Buka Toko (Shop)
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
