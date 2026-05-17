import React, { useState } from 'react';
import { Settings, X, Unlock, Zap, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { UserStats } from '../../../shared/types/user';

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
  sandboxAction: (payload: { hp?: number | null; mana?: number | null; level?: number | null; coins_delta?: number | null }) => Promise<void>;
};

export const DevSandboxPanel: React.FC<DevSandboxPanelProps> = ({ overrides, setOverrides, user, sandboxAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateOverride = (key: keyof DevOverrides, value: any) => {
    setOverrides(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-[999] w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-md border border-fuchsia-500/30 text-fuchsia-400 flex items-center justify-center hover:bg-slate-800 hover:scale-110 transition-all shadow-[0_0_15px_rgba(217,70,239,0.2)]"
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
            className="fixed bottom-24 right-4 z-[1000] w-[340px] max-w-[calc(100vw-32px)] bg-slate-900/95 backdrop-blur-xl border border-fuchsia-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
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
              
              {/* STATS CONTROLLER (Saved to DB) */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                  <span>Game State (Real DB)</span>
                  <span className="text-fuchsia-500/70 lowercase normal-case">persists</span>
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>HP Base</span>
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
                    <span>Mana Base</span>
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
                    <span>Coins Increment</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => sandboxAction({ coins_delta: 100 })} className="flex-1 text-[10px] py-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1"><Coins className="w-3 h-3"/> +100</button>
                    <button onClick={() => sandboxAction({ coins_delta: 1000 })} className="flex-1 text-[10px] py-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1"><Coins className="w-3 h-3"/> +1000</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Level Override</span>
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
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vibe Atmosphere</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Anxiety Score</span>
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
                    <span>Sigma/Fog</span>
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
                    <span>Force Theme</span>
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
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Unlocks</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => updateOverride('unlockAllBadges', !overrides.unlockAllBadges)}
                    className={`text-[10px] py-2 rounded border flex flex-col items-center justify-center gap-1 transition-colors ${overrides.unlockAllBadges ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <Zap className="w-4 h-4 mb-0.5" />
                    Unlock Badges
                  </button>
                  <button 
                    onClick={() => updateOverride('unlockAllShop', !overrides.unlockAllShop)}
                    className={`text-[10px] py-2 rounded border flex flex-col items-center justify-center gap-1 transition-colors ${overrides.unlockAllShop ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <Unlock className="w-4 h-4 mb-0.5" />
                    Unlock Shop
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
