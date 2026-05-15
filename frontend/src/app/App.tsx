import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Target } from 'lucide-react';
import { RPGHeader } from '../features/character/components/RPGHeader';
import { StatusScene } from '../features/character/components/StatusScene';
import { VibeEnvironment } from '../shared/components/VibeEnvironment';
import { QuestEditorModal } from '../features/quests/components/QuestEditorModal';
import { FirstTimeOnboarding } from '../features/onboarding/components/FirstTimeOnboarding';
import { ProfileModal } from '../features/profile/components/ProfileModal';
import { SettingsModal } from '../features/profile/components/SettingsModal';

import { useDashboardState } from '../features/dashboard/hooks/useDashboardState';
import { useQuest } from '../features/quests/hooks/useQuest';
import { useBrainDump } from '../features/brainDump/hooks/useBrainDump';

import { ExpPopupRenderer } from '../shared/components/ExpPopupRenderer';
import { BrainDumpModal } from '../features/brainDump/components/BrainDumpModal';
import { DeleteQuestModal } from '../features/quests/components/DeleteQuestModal';
import { BottomNavigation } from './layouts/BottomNavigation';
import { BottomStatusBar } from './layouts/BottomStatusBar';
import { QuestPanel } from '../features/quests/components/QuestPanel';
import { HubMonitoring } from '../features/dashboard/components/HubMonitoring';
import { BurnoutWarning } from '../features/character/components/BurnoutWarning';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

export interface Goal {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  reward_alpha: number;
  is_experimental: boolean;
  category: string;
  repetition_count: number;
  logs?: any[];
}

export type Tab = 'character' | 'quests' | 'dashboard';

export default function App() {
  const { 
    goals, setGoals, user, latestDump, burnoutMonitor, 
    expPopups, setExpPopups, fetchData, recentlyCompletedIds,
    updateProfile, resetProfile, nudge
  } = useDashboardState();

  const {
    selectedGoal, setSelectedGoal,
    isQuestEditorOpen, setIsQuestEditorOpen,
    questToDelete, setQuestToDelete,
    questToEdit, setQuestToEdit,
    handleLogAction, handleBranch, handleSaveQuest,
    confirmDeleteQuest, executeDeleteQuest
  } = useQuest(goals, fetchData, setExpPopups);

  const {
    isBrainDumpOpen, setIsBrainDumpOpen,
    draftContent, setDraftContent,
    isAnalyzing, handleBrainDump, analysisResult
  } = useBrainDump(fetchData);

  const [activeTab, setActiveTab] = useState<Tab>('quests');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const handleCompleteOnboarding = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('hasCompletedOnboarding', 'true');
  };

  const coins = user.level * 100 + goals.reduce((acc, goal) => acc + (goal.logs?.length || 0), 0) * 10;
  const commits = goals.reduce((acc, goal) => acc + (goal.logs?.length || 0), 0);

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
            commits={commits} 
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
        statusBar={<BottomStatusBar activeQuestsCount={goals.length} />}
        modals={
          <>
            <ExpPopupRenderer popups={expPopups} />
            <ProfileModal 
              isOpen={isProfileOpen} 
              onClose={() => setIsProfileOpen(false)} 
              user={user} 
              onSaveProfile={updateProfile} 
            />
            <SettingsModal 
              isOpen={isSettingsOpen} 
              onClose={() => setIsSettingsOpen(false)} 
              onExport={handleExportData} 
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
              <StatusScene hp={user.hp} mana={user.mana} level={user.level} goals={goals} nudge={nudge} userName={user.name} />
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
                // No need to switch tabs if we are on desktop. On mobile, we might already be on quests tab.
              }}
              onLogAction={handleLogAction}
              onBranch={handleBranch}
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
