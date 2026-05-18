import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cpu, User, Lock, Terminal, Zap, Loader2 } from 'lucide-react';
import { TopBar } from './layouts/TopBar';
import { StatusScene } from '../features/character/components/StatusScene';
import { VibeEnvironment } from '../shared/components/VibeEnvironment';
import { QuestEditorModal } from '../features/quests/components/QuestEditorModal';
import { FirstTimeOnboarding } from '../features/onboarding/components/FirstTimeOnboarding';
import { ProfileModal } from '../features/profile/components/ProfileModal';
import { SettingsModal } from '../features/profile/components/SettingsModal';

import { ExpPopupRenderer } from '../shared/components/ExpPopupRenderer';
import { BrainDumpModal } from '../features/brainDump/components/BrainDumpModal';
import { DeleteQuestModal } from '../features/quests/components/DeleteQuestModal';
import { BottomBar } from './layouts/BottomBar';
import { QuestPanel } from '../features/quests/components/QuestPanel';
import { HubMonitoring } from '../features/dashboard/components/HubMonitoring';
import { BurnoutWarning } from '../features/character/components/BurnoutWarning';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DevSandboxPanel } from '../shared/components/DevSandboxPanel';
import { calculateStats } from '../shared/utils/vibeMath';
import { getWeatherState } from '../shared/utils/weatherUtils';
import type { Goal } from '../shared/types/goal';
import { useAppContext } from './providers/AppProvider';
import { useDashboardContext } from './providers/DashboardProvider';
import { useQuestContext } from './providers/QuestProvider';
import { useBrainDumpContext } from './providers/BrainDumpProvider';
import { useAudio } from './providers/AudioProvider';
import { useAuthStore } from '../store/authStore';

import type { Tab } from '../shared/types/navigation';

export default function App() {
  const { tab } = useParams<{ tab: Tab }>();
  const navigate = useNavigate();
  const { playVictorySound, playLevelUpSound } = useAudio();

  const {
    user: authUser,
    isLoading: isAuthLoading,
    login,
    register,
    loginAsGuest,
    logout,
    initAuth
  } = useAuthStore();

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  const {
    isProfileOpen, setIsProfileOpen,
    isSettingsOpen, setIsSettingsOpen
  } = useAppContext();

  const {
    goals, setGoals, user, achievements, latestDump, burnoutMonitor,
    expPopups, recentlyCompletedIds, updateProfile, resetProfile, nudge,
    isLoading, updateSandbox, fetchData
  } = useDashboardContext();

  useEffect(() => {
    if (authUser) {
      fetchData();
    }
  }, [authUser, fetchData]);

  const {
    selectedGoal, setSelectedGoal, isQuestEditorOpen, setIsQuestEditorOpen,
    questToDelete, setQuestToDelete, questToEdit, setQuestToEdit,
    handleLogAction, handleSaveQuest, confirmDeleteQuest, executeDeleteQuest
  } = useQuestContext();

  const {
    isBrainDumpOpen, setIsBrainDumpOpen, draftContent, setDraftContent,
    isAnalyzing, handleBrainDump, analysisResult
  } = useBrainDumpContext();

  const prevCompletedCountRef = useRef(recentlyCompletedIds.length);
  useEffect(() => {
    if (recentlyCompletedIds.length > prevCompletedCountRef.current) {
      playVictorySound();
    }
    prevCompletedCountRef.current = recentlyCompletedIds.length;
  }, [recentlyCompletedIds, playVictorySound]);

  const prevLevelRef = useRef(user?.level);
  useEffect(() => {
    if (user && prevLevelRef.current && user.level > prevLevelRef.current) {
      playLevelUpSound();
    }
    if (user) prevLevelRef.current = user.level;
  }, [user?.level, playLevelUpSound]);

  const activeTab = tab || 'quests';
  const setActiveTab = (newTab: Tab) => navigate(`/${newTab}`);

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  });

  const handleExportData = async () => {
    try {
      const data = { user, goals };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rpg_backup_${new Date().getTime()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.user || !data.goals) {
        throw new Error('Invalid backup format');
      }

      const res = await fetch(`/api/user/${user?.id || 'import'}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Failed to import on server');
      
      window.location.reload();
    } catch (e) {
      console.error('Import failed', e);
      alert('Error importing data: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
    
    event.target.value = '';
  };

  const handleCompleteOnboarding = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('hasCompletedOnboarding', 'true');
  };

  const allLogs = goals.flatMap(g => g.logs || []);
  const stats = calculateStats(allLogs as any);

  const uLevel = user?.level ?? 1;
  const uExp = user?.exp ?? 0;
  const uSpentCoins = user?.spent_coins ?? 0;
  const baseCoins = user ? ((uLevel - 1) * 100) + uExp - uSpentCoins : 0;

  // --- DEV SANDBOX INJECTION ---
  const [devOverrides, setDevOverrides] = useState<import('../shared/components/DevSandboxPanel').DevOverrides>({
    anxietyScore: null,
    sigmaVariance: null,
    themeVibe: null,
    unlockAllBadges: false,
    unlockAllShop: false,
  });

  const effectiveUser = user ? { ...user } : null;
  if (effectiveUser) {
    if (devOverrides.themeVibe !== null) effectiveUser.theme_vibe = devOverrides.themeVibe;
    if (devOverrides.unlockAllShop) {
      effectiveUser.unlocked_items = JSON.stringify([
        'aesthetic_color_cyan', 'aesthetic_color_rose', 'aesthetic_theme_matrix', 'aesthetic_theme_neon', 'aesthetic_title_vanguard', 'aesthetic_title_legendary'
      ]);
    }
  }

  const effectiveCoins = baseCoins;
  const effectiveAnxietyScore = devOverrides.anxietyScore !== null ? devOverrides.anxietyScore : (latestDump?.anxietyScore || 5);
  const effectiveSigmaVariance = devOverrides.sigmaVariance !== null ? devOverrides.sigmaVariance : stats.sigma;
  
  const effectiveWeather = getWeatherState(effectiveAnxietyScore, effectiveSigmaVariance);

  const effectiveAchievements = devOverrides.unlockAllBadges 
    ? achievements.map(a => ({ ...a, isUnlocked: true, progress: 100 }))
    : achievements;
  // -----------------------------

  useEffect(() => {
    const currentTheme = effectiveUser?.theme_vibe || 'midnight';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [effectiveUser?.theme_vibe]);

  if (isAuthLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-surface text-accent-400">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-10 w-10 animate-spin opacity-75" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <div className="text-xs font-mono uppercase tracking-widest text-accent-500/70 animate-pulse">Authenticating...</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      if (!username.trim() || !password.trim()) {
        setAuthError('Username dan password tidak boleh kosong');
        return;
      }
      setIsSubmitting(true);
      try {
        if (isRegistering) {
          await register(username, password);
        } else {
          await login(username, password);
        }
      } catch (err: any) {
        setAuthError(err.message || 'Authentication failed');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleGuestLogin = async () => {
      setAuthError('');
      setIsSubmitting(true);
      try {
        await loginAsGuest();
      } catch (err: any) {
        setAuthError(err.message || 'Guest session failed');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-[#05070a]/95 backdrop-blur-md overflow-hidden font-sans select-none">
        {/* Animated grid visual background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
          <div className="w-[1000px] h-[1000px] bg-linear-to-tr from-cyan-500/10 via-transparent to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Cyberpunk Glass Card Container */}
          <div className="bg-slate-950/80 border border-slate-800/80 shadow-[0_0_50px_rgba(6,182,212,0.15),inset_0_1px_rgba(255,255,255,0.05)] rounded-2xl p-8 relative overflow-hidden">
            {/* Corner Bracket Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-500/40 rounded-br-xl"></div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-xl mb-4 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                <Cpu className="w-8 h-8 animate-pulse" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">
                VIBE<span className="text-cyan-400">COMMIT</span>
              </h1>
              <p className="text-xs font-mono text-cyan-500/60 uppercase tracking-widest">
                System Version v4.0.0 // Offline Protocol
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {/* Form Input fields */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-cyan-500/80 rounded-xl text-white font-mono text-sm tracking-wider placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-cyan-500/80 rounded-xl text-white font-mono text-sm tracking-wider placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Alert terminal style */}
              {authError && (
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg text-rose-400 font-mono text-xs flex gap-2 items-start">
                  <span className="text-rose-500 animate-pulse font-bold">[!]</span>
                  <span>{authError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold tracking-widest uppercase transition-all rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <Terminal className="w-4 h-4" />
                    <span>{isRegistering ? 'REGISTER' : 'LOGIN'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Separator / Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800/60"></div>
              </div>
              <span className="relative px-3 bg-[#0A0C10] text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                atau masuk sebagai guest
              </span>
            </div>

            {/* Guest/Bypass button */}
            <button
              onClick={handleGuestLogin}
              disabled={isSubmitting}
              type="button"
              className="w-full py-3 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-800/30 hover:border-emerald-500/50 text-emerald-400 font-bold tracking-widest uppercase transition-all rounded-xl flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>MASUK SEBAGAI GUEST</span>
            </button>

            {/* Switch Mode Toggle */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthError('');
                }}
                className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-wider"
              >
                {isRegistering
                  ? 'Sudah punya akun? Login'
                  : 'Belum punya akun? Register'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !effectiveUser) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-surface text-cyan-400">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-10 w-10 animate-spin opacity-75" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <div className="text-xs font-mono uppercase tracking-widest text-accent-500/70 animate-pulse">Initializing System...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {!hasCompletedOnboarding && (
          <FirstTimeOnboarding onComplete={handleCompleteOnboarding} />
        )}
      </AnimatePresence>
      
      <MainLayout
        environment={
          <VibeEnvironment 
            anxietyScore={effectiveAnxietyScore} 
            sigmaVariance={effectiveSigmaVariance} 
            customMainBg={effectiveUser.custom_main_bg}
            themeVibe={effectiveUser.theme_vibe}
            hp={effectiveUser.hp}
          />
        }
        header={<TopBar hp={effectiveUser.hp} mana={effectiveUser.mana} level={effectiveUser.level} exp={effectiveUser.exp} coins={effectiveCoins} user={effectiveUser} onOpenProfile={() => setIsProfileOpen(true)} onOpenSettings={() => setIsSettingsOpen(true)} />}
        bottomNav={
          <BottomBar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenBrainDump={() => setIsBrainDumpOpen(true)}
            onNewQuest={() => { setQuestToEdit(null); setIsQuestEditorOpen(true); }}
          />
        }
        modals={
          <>
            <ExpPopupRenderer popups={expPopups} />
            <ProfileModal 
              isOpen={isProfileOpen} 
              onClose={() => setIsProfileOpen(false)} 
              user={effectiveUser} 
              achievements={effectiveAchievements}
              onSaveProfile={updateProfile} 
              coins={effectiveCoins}
            />
            <SettingsModal 
              isOpen={isSettingsOpen} 
              onClose={() => setIsSettingsOpen(false)} 
              user={effectiveUser}
              onUpdateUser={updateProfile}
              onExport={handleExportData} 
              onImport={handleImportData}
              onResetProgress={resetProfile}
              onLogout={async () => {
                await logout();
                setIsSettingsOpen(false);
              }}
            />
            <QuestEditorModal 
              isOpen={isQuestEditorOpen} 
              onClose={() => { setIsQuestEditorOpen(false); setQuestToEdit(null); }}
              onSave={handleSaveQuest}
              initialData={questToEdit}
            />
            <DeleteQuestModal
              questId={questToDelete}
              onClose={() => setQuestToDelete(null)}
              onConfirm={() => executeDeleteQuest()}
            />
            <BrainDumpModal 
              isOpen={isBrainDumpOpen}
              onClose={() => setIsBrainDumpOpen(false)}
              isAnalyzing={isAnalyzing}
              draftContent={draftContent}
              setDraftContent={setDraftContent}
              onSubmit={handleBrainDump}
              analysisResult={analysisResult}
            />
          </>
        }
      >
        <DashboardLayout 
          activeTab={activeTab}
          rightSidebar={
            <>
              <StatusScene hp={effectiveUser.hp} mana={effectiveUser.mana} level={effectiveUser.level} goals={goals} nudge={nudge} userName={effectiveUser.name} customCharBg={effectiveUser.custom_char_bg} customCharacter={effectiveUser.custom_character} weather={effectiveWeather} />
              <BurnoutWarning burnoutMonitor={burnoutMonitor} />
            </>
          }
          mainContent={
            <HubMonitoring goals={goals} />
          }
          leftSidebar={
            <QuestPanel 
              goals={goals}
              selectedGoal={selectedGoal}
              latestDump={latestDump}
              onSelectGoal={(goal) => {
                setSelectedGoal(selectedGoal?.id === goal.id ? null : goal);
              }}
              onLogAction={handleLogAction}
              onEdit={(goal) => { setQuestToEdit(goal); setIsQuestEditorOpen(true); }}
              onDrop={confirmDeleteQuest}
              onOpenBrainDump={() => setIsBrainDumpOpen(true)}
              onNewQuest={() => { setQuestToEdit(null); setIsQuestEditorOpen(true); }}
              recentlyCompletedIds={recentlyCompletedIds}
            />
          }
        />
      </MainLayout>
      <DevSandboxPanel overrides={devOverrides} setOverrides={setDevOverrides} user={effectiveUser} sandboxAction={updateSandbox} />
    </>
  );
}
