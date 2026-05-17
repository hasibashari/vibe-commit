import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useToastStore } from '../store/toastStore';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DevSandboxPanel } from '../shared/components/DevSandboxPanel';
import { calculateStats } from '../shared/utils/vibeMath';
import { getWeatherState } from '../shared/utils/weatherUtils';
import { importDataAPI } from '../features/dashboard/services/dashboardApi';
import type { Goal } from '../shared/types/goal';
import { useUIStore } from '../store/uiStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useQuestStore } from '../store/questStore';
import { useBrainDumpStore } from '../store/brainDumpStore';
import { useAudio } from './providers/AudioProvider';
import { useAuthStore } from '../store/authStore';

import type { Tab } from '../shared/types/navigation';

export default function App() {
  const { tab } = useParams<{ tab: Tab }>();
  const navigate = useNavigate();
  const { playVictorySound, playLevelUpSound } = useAudio();
  const toast = useToastStore(state => state.toast);

  const {
    user: authUser,
    isLoading: isAuthLoading,
    hasCompletedOnboarding,
    completeOnboarding,
    login,
    initAuth
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  // UI Store access
  const isProfileOpen = useUIStore((state) => state.isProfileOpen);
  const setIsProfileOpen = useUIStore((state) => state.setIsProfileOpen);
  const isSettingsOpen = useUIStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useUIStore((state) => state.setIsSettingsOpen);
  const isQuestEditorOpen = useUIStore((state) => state.isQuestEditorOpen);
  const setIsQuestEditorOpen = useUIStore((state) => state.setIsQuestEditorOpen);

  // Dashboard Store access
  const {
    goals, setGoals, user, achievements, latestDump, burnoutMonitor,
    expPopups, recentlyCompletedIds, updateProfile, resetProfile, deleteAccount, nudge,
    isLoading, updateSandbox, fetchData
  } = useDashboardStore();

  useEffect(() => {
    if (authUser) {
      fetchData();
    }
  }, [authUser, fetchData]);

  // Quest Store access
  const {
    selectedGoal, setSelectedGoal, 
    questToDelete, setQuestToDelete, questToEdit, setQuestToEdit,
    handleLogAction, handleSaveQuest, confirmDeleteQuest, executeDeleteQuest
  } = useQuestStore();

  // Brain Dump Store access
  const {
    isBrainDumpOpen, setIsBrainDumpOpen, draftContent, setDraftContent,
    isAnalyzing, handleBrainDump, analysisResult
  } = useBrainDumpStore();

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

      await importDataAPI(data);
      
      window.location.reload();
    } catch (e) {
      console.error('Import failed', e);
      toast({ title: 'Gagal Import Data', description: e instanceof Error ? e.message : 'Unknown error', type: 'error' });
    }
    
    event.target.value = '';
  };

  const handleCompleteOnboarding = () => {
    completeOnboarding();
  };

  const allLogs = goals.flatMap(g => g.logs || []);
  const stats = calculateStats(allLogs);
  const uLevel = user?.level ?? 1;
  const uExpPercent = user?.exp ?? 0;
  const uTotalExp = (user as UserStats & { total_exp?: number })?.total_exp ?? 0;
  const uSpentCoins = user?.spent_coins ?? 0;
  const baseCoins = user ? uTotalExp - uSpentCoins : 0;

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
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#0A0C10] text-accent-400">
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
    if (!hasCompletedOnboarding) {
      return (
        <FirstTimeOnboarding 
          onLogin={login} 
          showLoginStep={true} 
        />
      );
    }

    // Already completed onboarding but not logged in -> show login slide immediately
    return (
      <FirstTimeOnboarding 
        onLogin={login} 
        showLoginStep={true} 
        initialStep={4} 
      />
    );
  }

  if (!hasCompletedOnboarding) {
    // If they are somehow logged in but haven't seen the onboarding (e.g. from previous version)
    return <FirstTimeOnboarding onComplete={handleCompleteOnboarding} showLoginStep={false} />;
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
              onDeleteAccount={deleteAccount}
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
