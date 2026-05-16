import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { RPGHeader } from '../features/character/components/RPGHeader';
import { StatusScene } from '../features/character/components/StatusScene';
import { VibeEnvironment } from '../shared/components/VibeEnvironment';
import { QuestEditorModal } from '../features/quests/components/QuestEditorModal';
import { FirstTimeOnboarding } from '../features/onboarding/components/FirstTimeOnboarding';
import { ProfileModal } from '../features/profile/components/ProfileModal';
import { SettingsModal } from '../features/profile/components/SettingsModal';

import { ExpPopupRenderer } from '../shared/components/ExpPopupRenderer';
import { BrainDumpModal } from '../features/brainDump/components/BrainDumpModal';
import { DeleteQuestModal } from '../features/quests/components/DeleteQuestModal';
import { BottomNavigation } from './layouts/BottomNavigation';
import { QuestPanel } from '../features/quests/components/QuestPanel';
import { HubMonitoring } from '../features/dashboard/components/HubMonitoring';
import { BurnoutWarning } from '../features/character/components/BurnoutWarning';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import type { Goal } from '../shared/types/goal';
import { useAppContext } from './providers/AppProvider';
import { useAudio } from './providers/AudioProvider';

export type Tab = 'character' | 'quests' | 'dashboard';

export default function App() {
  const { tab } = useParams<{ tab: Tab }>();
  const navigate = useNavigate();
  const { playVictorySound, playLevelUpSound } = useAudio();

  const {
    isProfileOpen, setIsProfileOpen,
    isSettingsOpen, setIsSettingsOpen,
    goals, setGoals, user, achievements, latestDump, burnoutMonitor,
    expPopups, recentlyCompletedIds, updateProfile, resetProfile, nudge,
    selectedGoal, setSelectedGoal, isQuestEditorOpen, setIsQuestEditorOpen,
    questToDelete, setQuestToDelete, questToEdit, setQuestToEdit,
    handleLogAction, handleSaveQuest, confirmDeleteQuest, executeDeleteQuest,
    isBrainDumpOpen, setIsBrainDumpOpen, draftContent, setDraftContent,
    isAnalyzing, handleBrainDump, analysisResult, isLoading
  } = useAppContext();

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

  const coins = user?.level * 100 + goals.reduce((acc, goal) => acc + (goal.logs?.length || 0), 0) * 10;


  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#0A0C10] text-cyan-400">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-10 w-10 animate-spin opacity-75" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-500/70 animate-pulse">Initializing System...</div>
        </div>
      </div>
    );
  }

  if (!user) return null; // Avoid render if context is not hydrated yet.

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
            anxietyScore={latestDump?.anxietyScore || 5} 
            sigmaVariance={user.mana} 
            customMainBg={user.custom_main_bg}
            themeVibe={user.theme_vibe}
          />
        }
        header={<RPGHeader hp={user.hp} mana={user.mana} level={user.level} exp={user.exp} coins={coins} user={user} onOpenProfile={() => setIsProfileOpen(true)} onOpenSettings={() => setIsSettingsOpen(true)} />}
        bottomNav={
          <BottomNavigation 
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
              user={user} 
              achievements={achievements}
              onSaveProfile={updateProfile} 
            />
            <SettingsModal 
              isOpen={isSettingsOpen} 
              onClose={() => setIsSettingsOpen(false)} 
              user={user}
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
              onConfirm={() => executeDeleteQuest(setGoals as any)}
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
              <StatusScene hp={user.hp} mana={user.mana} level={user.level} goals={goals} nudge={nudge} userName={user.name} customCharBg={user.custom_char_bg} customCharacter={user.custom_character} />
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
                setSelectedGoal(goal);
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
    </>
  );
}
