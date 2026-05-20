import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from './layouts/TopBar';
import { StatusScene } from '../features/character/components/StatusScene';
import { VibeEnvironment } from '../shared/components/VibeEnvironment';

import { ExpPopupRenderer } from '../shared/components/ExpPopupRenderer';
import { BottomBar } from './layouts/BottomBar';
import { QuestPanel } from '../features/quests/components/QuestPanel';
import { BurnoutWarning } from '../features/character/components/BurnoutWarning';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

const HubMonitoring = React.lazy(() => import('../features/dashboard/components/HubMonitoring').then(m => ({ default: m.HubMonitoring })));
const QuestEditorModal = React.lazy(() => import('../features/quests/components/QuestEditorModal').then(m => ({ default: m.QuestEditorModal })));
const BrainDumpModal = React.lazy(() => import('../features/brainDump/components/BrainDumpModal').then(m => ({ default: m.BrainDumpModal })));
const FirstTimeOnboarding = React.lazy(() => import('../features/onboarding/components/FirstTimeOnboarding').then(m => ({ default: m.FirstTimeOnboarding })));
const ProfileModal = React.lazy(() => import('../features/profile/components/ProfileModal').then(m => ({ default: m.ProfileModal })));
const SettingsModal = React.lazy(() => import('../features/profile/components/SettingsModal').then(m => ({ default: m.SettingsModal })));
const DeleteQuestModal = React.lazy(() => import('../features/quests/components/DeleteQuestModal').then(m => ({ default: m.DeleteQuestModal })));
const DevSandboxPanel = React.lazy(() => import('../shared/components/DevSandboxPanel').then(m => ({ default: m.DevSandboxPanel })));
import { calculateStats } from '../shared/utils/vibeMath';
import { getWeatherState } from '../shared/utils/weatherUtils';

import { useAppContext } from './providers/AppProvider';
import { useDashboardContext } from './providers/DashboardProvider';
import { useQuestContext } from './providers/QuestProvider';
import { useBrainDumpContext } from './providers/BrainDumpProvider';
import { useAudio } from './providers/AudioProvider';
import { useAuthStore } from '../store/authStore';
import { useDashboardStore } from '../store/dashboardStore';
import { getAuthHeaders } from '../shared/services/session';

function getExpNeededForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

function getCumulativeExp(level: number, exp: number): number {
  let sum = 0;
  for (let i = 1; i < level; i++) {
    sum += getExpNeededForLevel(i);
  }
  return sum + exp;
}

import type { Tab } from '../shared/types/navigation';

export default function App() {
  const { tab } = useParams<{ tab: Tab }>();
  const navigate = useNavigate();
  const { playVictorySound, playLevelUpSound } = useAudio();

  const {
    user: authUser,
    isLoading: isAuthLoading,
    logout,
    deleteAccount,
    initAuth,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  const { isProfileOpen, setIsProfileOpen, isSettingsOpen, setIsSettingsOpen } = useAppContext();

  const {
    goals,
    user,
    achievements,
    latestDump,
    burnoutMonitor,
    expPopups,
    recentlyCompletedIds,
    updateProfile,
    resetProfile,
    nudge,
    isLoading,
    updateSandbox,
    fetchData,
  } = useDashboardContext();

  useEffect(() => {
    if (authUser) {
      fetchData();
    }
  }, [authUser, fetchData]);

  const {
    selectedGoal,
    setSelectedGoal,
    isQuestEditorOpen,
    setIsQuestEditorOpen,
    questToDelete,
    setQuestToDelete,
    questToEdit,
    setQuestToEdit,
    handleLogAction,
    handleSaveQuest,
    confirmDeleteQuest,
    executeDeleteQuest,
  } = useQuestContext();

  const {
    isBrainDumpOpen,
    setIsBrainDumpOpen,
    draftContent,
    setDraftContent,
    isAnalyzing,
    handleBrainDump,
    analysisResult,
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
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
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
    localStorage.setItem('hasCompletedOnboarding', 'true');
  };

  const allLogs = useMemo(() => goals.flatMap(g => g.logs || []), [goals]);
  const stats = useMemo(() => calculateStats(allLogs as any), [allLogs]);

  const uLevel = user?.level ?? 1;
  const uExp = user?.exp ?? 0;
  const uSpentCoins = user?.spent_coins ?? 0;
  const baseCoins = user ? getCumulativeExp(uLevel, uExp) - uSpentCoins : 0;

  // --- DEV SANDBOX INJECTION ---
  const [devOverrides, setDevOverrides] = useState<
    import('../shared/components/DevSandboxPanel').DevOverrides
  >({
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
        'aesthetic_color_cyan',
        'aesthetic_color_rose',
        'aesthetic_theme_matrix',
        'aesthetic_theme_neon',
        'aesthetic_title_vanguard',
        'aesthetic_title_legendary',
      ]);
    }
  }

  const effectiveCoins = baseCoins;
  const effectiveAnxietyScore =
    devOverrides.anxietyScore !== null ? devOverrides.anxietyScore : latestDump?.anxietyScore || 5;
  const effectiveSigmaVariance =
    devOverrides.sigmaVariance !== null ? devOverrides.sigmaVariance : stats.sigma;

  const effectiveWeather = getWeatherState(effectiveAnxietyScore, effectiveSigmaVariance);

  const effectiveAchievements = devOverrides.unlockAllBadges
    ? achievements.map(a => ({ ...a, isUnlocked: true, progress: 100 }))
    : achievements;
  // -----------------------------

  useEffect(() => {
    const currentTheme = effectiveUser?.theme_vibe || 'midnight';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [effectiveUser?.theme_vibe]);

  useEffect(() => {
    if (!authUser) return;

    const handleOnline = () => {
      useDashboardStore.getState().syncOfflineData();
    };

    window.addEventListener('online', handleOnline);

    if (navigator.onLine) {
      useDashboardStore.getState().syncOfflineData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [authUser]);

  if (isAuthLoading) {
    return (
      <div className='flex h-dvh w-full items-center justify-center bg-surface text-accent-400'>
        <div className='flex flex-col items-center gap-4'>
          <svg className='h-10 w-10 animate-spin opacity-75' viewBox='0 0 24 24'>
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
              fill='none'
            />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
          </svg>
          <div className='text-xs font-mono uppercase tracking-widest text-accent-500/70 animate-pulse'>
            Authenticating...
          </div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <FirstTimeOnboarding onComplete={handleCompleteOnboarding} />;
  }

  if (isLoading || !effectiveUser) {
    return (
      <div className='flex h-dvh w-full items-center justify-center bg-surface text-cyan-400'>
        <div className='flex flex-col items-center gap-4'>
          <svg className='h-10 w-10 animate-spin opacity-75' viewBox='0 0 24 24'>
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
              fill='none'
            />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
          </svg>
          <div className='text-xs font-mono uppercase tracking-widest text-accent-500/70 animate-pulse'>
            Initializing System...
          </div>
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
        header={
          <TopBar
            hp={effectiveUser.hp}
            mana={effectiveUser.mana}
            level={effectiveUser.level}
            exp={effectiveUser.exp}
            coins={effectiveCoins}
            user={effectiveUser}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        }
        bottomNav={
          <BottomBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenBrainDump={() => setIsBrainDumpOpen(true)}
            onNewQuest={() => {
              setQuestToEdit(null);
              setIsQuestEditorOpen(true);
            }}
          />
        }
        modals={
          <React.Suspense fallback={null}>
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
              onDeleteAccount={async () => {
                await deleteAccount();
                setIsSettingsOpen(false);
              }}
            />
            <QuestEditorModal
              isOpen={isQuestEditorOpen}
              onClose={() => {
                setIsQuestEditorOpen(false);
                setQuestToEdit(null);
              }}
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
          </React.Suspense>
        }
      >
        <DashboardLayout
          activeTab={activeTab}
          rightSidebar={
            <>
              <StatusScene
                hp={effectiveUser.hp}
                mana={effectiveUser.mana}
                level={effectiveUser.level}
                goals={goals}
                nudge={nudge}
                userName={effectiveUser.name}
                customCharBg={effectiveUser.custom_char_bg}
                weather={effectiveWeather}
              />
              <BurnoutWarning burnoutMonitor={burnoutMonitor} />
            </>
          }
          mainContent={
            <React.Suspense fallback={
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400" />
                <span className="text-xs font-mono text-slate-400">Loading Command Hub...</span>
              </div>
            }>
              <HubMonitoring goals={goals} />
            </React.Suspense>
          }
          leftSidebar={
            <QuestPanel
              goals={goals}
              selectedGoal={selectedGoal}
              latestDump={latestDump}
              onSelectGoal={goal => {
                setSelectedGoal(selectedGoal?.id === goal.id ? null : goal);
              }}
              onLogAction={handleLogAction}
              onEdit={goal => {
                setQuestToEdit(goal);
                setIsQuestEditorOpen(true);
              }}
              onDrop={confirmDeleteQuest}
              onOpenBrainDump={() => setIsBrainDumpOpen(true)}
              onNewQuest={() => {
                setQuestToEdit(null);
                setIsQuestEditorOpen(true);
              }}
              recentlyCompletedIds={recentlyCompletedIds}
            />
          }
        />
      </MainLayout>
      {import.meta.env.DEV && (
        <React.Suspense fallback={null}>
          <DevSandboxPanel
            overrides={devOverrides}
            setOverrides={setDevOverrides}
            user={effectiveUser}
            sandboxAction={updateSandbox}
          />
        </React.Suspense>
      )}
    </>
  );
}
