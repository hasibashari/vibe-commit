import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Download, Sparkles, Globe, Activity, RefreshCw, TriangleAlert } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventBackdropClose={isResetConfirm}
    >
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <SettingsIcon className="w-5 h-5 text-slate-400" />
        <h3 className="text-xl font-bold text-white tracking-tight">System Settings</h3>
      </div>
      <div className="p-6 flex flex-col gap-6">
        
        {/* Localization */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Globe className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest">Localization</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => updateSetting('language', 'id')}
              className={`py-2 px-3 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                settings.language === 'id' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
              }`}
            >
              Indonesian
            </button>
            <button 
              onClick={() => updateSetting('language', 'en')}
              className={`py-2 px-3 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
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
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest">Visual Effects</h4>
          </div>
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Enable Animations</span>
              <span className="text-xs text-slate-500">Smooth transitions & visual popups</span>
            </div>
            <button 
              onClick={() => updateSetting('animations', !settings.animations)}
              className={`relative w-12 h-6 rounded-full transition-colors ${settings.animations ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.animations ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* AI & System */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest">System Nudge Intensity</h4>
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
                  <span className="text-xs text-slate-500">
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
        <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data Management</h4>
          <Button 
            variant="secondary"
            onClick={onExport}
            className="w-full gap-2"
          >
            <Download className="w-4 h-4" />
            Export Local Backup
          </Button>
        </div>

        <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
          <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest">Danger Zone</h4>
          
          {!isResetConfirm ? (
            <Button 
              variant="danger"
              onClick={() => setIsResetConfirm(true)}
              className="w-full gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset All Progress
            </Button>
          ) : (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-start gap-3 text-rose-400 text-sm">
                <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>This will permanently erase all your quests, logs, exp, and stats. This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="secondary"
                  onClick={() => setIsResetConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Confirm Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
