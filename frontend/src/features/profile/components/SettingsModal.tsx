import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings as SettingsIcon, Download, Sparkles, Globe, Activity, RefreshCw, TriangleAlert } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onResetProgress: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onExport, onResetProgress }) => {
  const [settings, setSettings] = useState({
    language: 'id',
    animations: true,
    nudgeIntensity: 'normal'
  });
  const [isResetConfirm, setIsResetConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        try { setSettings(JSON.parse(saved)); } catch (e) {}
      }
    }
  }, [isOpen]);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  const handleReset = async () => {
    await onResetProgress();
    setIsResetConfirm(false);
    onClose();
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0A0C10] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase">System Settings</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-6 overflow-y-auto">
                
                {/* Localization */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe className="w-3.5 h-3.5" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Localization</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => updateSetting('language', 'id')}
                      className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded border transition-colors ${
                        settings.language === 'id' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      Indonesian
                    </button>
                    <button 
                      onClick={() => updateSetting('language', 'en')}
                      className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded border transition-colors ${
                        settings.language === 'en' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* UI Preferences */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Visual Effects</h4>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-300">Enable Animations</span>
                      <span className="text-[10px] text-slate-500">Smooth transitions & visual popups</span>
                    </div>
                    <button 
                      onClick={() => updateSetting('animations', !settings.animations)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${settings.animations ? 'bg-cyan-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.animations ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* AI & System */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-3.5 h-3.5" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">System Nudge Intensity</h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    {['relaxed', 'normal', 'strict'].map((level) => (
                      <button 
                        key={level}
                        onClick={() => updateSetting('nudgeIntensity', level)}
                        className={`flex items-center p-3 rounded-lg border transition-all ${
                          settings.nudgeIntensity === level 
                            ? 'bg-indigo-500/10 border-indigo-500/50' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full mr-3 ${settings.nudgeIntensity === level ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                        <div className="flex flex-col items-start text-left">
                          <span className={`text-xs font-bold uppercase tracking-wider ${settings.nudgeIntensity === level ? 'text-indigo-300' : 'text-slate-400'}`}>
                            {level}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {level === 'relaxed' && 'Minimal reminders, low stress'}
                            {level === 'normal' && 'Balanced reminders & motivation'}
                            {level === 'strict' && 'Aggressive tracking & high discipline'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Management */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/50">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Management</h4>
                  <button 
                    onClick={onExport}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded text-xs font-bold uppercase tracking-wider border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Local Backup
                  </button>
                </div>

                <div className="flex flex-col gap-4 pt-4 border-t border-slate-800/50">
                  <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Danger Zone</h4>
                  
                  {!isResetConfirm ? (
                    <button 
                      onClick={() => setIsResetConfirm(true)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded text-xs font-bold uppercase tracking-wider border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset All Progress
                    </button>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex flex-col gap-3">
                      <div className="flex items-start gap-2 text-rose-400 text-xs">
                        <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>This will permanently erase all your quests, logs, exp, and stats. This cannot be undone.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsResetConfirm(false)}
                          className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleReset}
                          className="flex-1 py-2 bg-rose-500 text-white text-xs font-bold rounded uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                        >
                          Confirm Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
