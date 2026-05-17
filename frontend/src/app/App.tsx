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
import { DashboardLayout } from './layouts/DashboardLayout';
import { DevSandboxPanel } from '../shared/components/DevSandboxPanel';
import { calculateStats } from '../shared/utils/vibeMath';
import type { Goal } from '../shared/types/goal';
import { useAppContext } from './providers/AppProvider';
import { useDashboardContext } from './providers/DashboardProvider';
import { useQuestContext } from './providers/QuestProvider';
import { useBrainDumpContext } from './providers/BrainDumpProvider';
import { useAudio } from './providers/AudioProvider';

import type { Tab } from '../shared/types/navigation';

export default function App() {
  const { tab } = useParams<{ tab: Tab }>();
  const navigate = useNavigate();
  const { playVictorySound, playLevelUpSound } = useAudio();

  const {
    isProfileOpen, setIsProfileOpen,
    isSettingsOpen, setIsSettingsOpen
  } = useAppContext();

  const {
    goals, setGoals, user, achievements, latestDump, burnoutMonitor,
    expPopups, recentlyCompletedIds, updateProfile, resetProfile, nudge,
    isLoading, updateSandbox
  } = useDashboardContext();

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

      const res = await fetch(`/api/user/${user.id}/import`, {
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

  const baseCoins = user ? (user.level * 100) + goals.reduce((acc, goal) => acc + (goal.logs?.length || 0), 0) * 10 - (user.spent_coins || 0) : 0;

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
  
  const effectiveAchievements = devOverrides.unlockAllBadges 
    ? achievements.map(a => ({ ...a, isUnlocked: true, progress: 100 }))
    : achievements;
  // -----------------------------

  useEffect(() => {
    const currentTheme = effectiveUser?.theme_vibe || 'midnight';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [effectiveUser?.theme_vibe]);

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#0A0C10] text-accent-400">
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

  if (!user || !effectiveUser) return null; // Avoid render if context is not hydrated yet.

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
              onConfirm={() => executeDeleteQuest(setGoals)}
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
              <StatusScene hp={effectiveUser.hp} mana={effectiveUser.mana} level={effectiveUser.level} goals={goals} nudge={nudge} userName={effectiveUser.name} customCharBg={effectiveUser.custom_char_bg} customCharacter={effectiveUser.custom_character} />
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
                setSelectedGoal(prev => (prev?.id === goal.id ? null : goal));
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
