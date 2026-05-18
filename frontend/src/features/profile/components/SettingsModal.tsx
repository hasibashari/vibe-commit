import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Download, Sparkles, Globe, Activity, RefreshCw, TriangleAlert, Image, ImagePlus, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import type { UserStats } from '../../../shared/types/user';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserStats;
  onUpdateUser: (data: Partial<UserStats>) => Promise<void>;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetProgress: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onUpdateUser, onExport, onImport, onResetProgress, onLogout }) => {
  const [settings, setSettings] = useState({
    language: 'id',
    animations: true,
    nudgeIntensity: 'normal'
  });
  const [isResetConfirm, setIsResetConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        try { setSettings(JSON.parse(saved)); } catch (e) {}
      }
    }
  }, [isOpen]);

  const updateSetting = (key: string, value: string | boolean | number) => {
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, key: 'custom_main_bg' | 'custom_char_bg' | 'custom_character') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large! Maximum size is 2MB per image to prevent database strain.");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await onUpdateUser({ [key]: base64String });
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert("Failed to read file.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploading(false);
    }
    event.target.value = '';
  };

  const resetCustomization = async (key: 'custom_main_bg' | 'custom_char_bg' | 'custom_character') => {
    await onUpdateUser({ [key]: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventBackdropClose={isResetConfirm}
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-slate-400" />
          <h3 className="text-xl font-bold text-white tracking-tight">System Settings</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 sm:p-6 flex flex-col gap-6">
        
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
                settings.language === 'id' ? 'bg-accent-500/20 border-accent-500/50 text-accent-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
              }`}
            >
              Indonesian
            </button>
            <button 
              onClick={() => updateSetting('language', 'en')}
              className={`py-2 px-3 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                settings.language === 'en' ? 'bg-accent-500/20 border-accent-500/50 text-accent-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
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
              className={`relative w-12 h-6 rounded-full transition-colors ${settings.animations ? 'bg-accent-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.animations ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Visual Customization */}
        <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-slate-400">
            <Image className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest">Visual & Audio Vibe</h4>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Theme Vibe</span>
              <span className="text-xs text-slate-500">Preset color palettes</span>
            </div>
            <select
              value={user.theme_vibe || 'midnight'}
              onChange={(e) => onUpdateUser({ theme_vibe: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-accent-500 w-full sm:w-auto"
            >
              <option value="midnight">Midnight Dev (Default)</option>
              <option value="emerald">Emerald Forest</option>
              <option value="sunset">Retro Sunset</option>
              <option 
                value="neon" 
                disabled={!(user.unlocked_items && user.unlocked_items.includes('aesthetic_theme_neon'))}
              >
                Neon City {!(user.unlocked_items && user.unlocked_items.includes('aesthetic_theme_neon')) && '(🔒 Locked)'}
              </option>
              <option 
                value="matrix" 
                disabled={!(user.unlocked_items && user.unlocked_items.includes('aesthetic_theme_matrix'))}
              >
                Matrix Green {!(user.unlocked_items && user.unlocked_items.includes('aesthetic_theme_matrix')) && '(🔒 Locked)'}
              </option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Background Music</span>
              <span className="text-xs text-slate-500">Adaptive ambient sounds</span>
            </div>
            <select
              value={user.bgm_theme || 'nature'}
              onChange={(e) => onUpdateUser({ bgm_theme: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-accent-500 w-full sm:w-auto"
            >
              <option value="nature">Nature / Acoustic (Default)</option>
              <option value="dynamic">Adaptive (Based on Anxiety)</option>
              <option value="cyber">Cyber-Zen (Synth)</option>
              <option value="coffee">Coffee Shop / Lo-Fi</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'custom_character', label: 'Custom Character (Sprite/GIF)', value: user.custom_character },
              { id: 'custom_main_bg', label: 'Main Background', value: user.custom_main_bg },
              { id: 'custom_char_bg', label: 'Character Background', value: user.custom_char_bg },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">{item.label}</span>
                  <span className="text-xs text-slate-500">
                    {item.value ? 'Customized' : 'Default'}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  {item.value && (
                    <button 
                      onClick={() => resetCustomization(item.id as 'custom_character' | 'custom_main_bg' | 'custom_char_bg')}
                      className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-500/10 rounded"
                    >
                      Reset
                    </button>
                  )}
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, item.id as 'custom_character' | 'custom_main_bg' | 'custom_char_bg')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <Button variant="secondary" className="px-3 py-1.5 h-auto text-xs gap-1 pointer-events-none" disabled={isUploading}>
                      <ImagePlus className="w-3 h-3" />
                      {isUploading ? '...' : 'Upload'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
          
          <div className="relative w-full">
            <input 
              type="file" 
              accept=".json"
              onChange={onImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Import Local Backup"
            />
            <Button 
              variant="secondary"
              className="w-full gap-2 pointer-events-none"
            >
              <Download className="w-4 h-4 rotate-180" />
              Import Local Backup
            </Button>
          </div>
        </div>

        {/* Session Management */}
        <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Session Control</h4>
          <Button 
            variant="secondary"
            onClick={onLogout}
            className="w-full gap-2 border-indigo-500/30 hover:border-indigo-500/80 hover:bg-indigo-500/10 text-indigo-300 pointer-events-auto cursor-pointer"
          >
            <Activity className="w-4 h-4 rotate-90" />
            DEACTIVATE SESSION (LOG OUT)
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
