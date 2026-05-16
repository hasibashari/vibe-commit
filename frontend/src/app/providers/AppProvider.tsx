import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Goal } from '../../shared/types/goal';
import type { UserStats } from '../../shared/types/user';
import type { Achievement } from '../../features/dashboard/utils/dashboardUtils';
import type { BurnoutPrediction } from '../../shared/services/analyticsService';
import { useDashboardState } from '../../features/dashboard/hooks/useDashboardState';
import { useQuest } from '../../features/quests/hooks/useQuest';
import { useBrainDump } from '../../features/brainDump/hooks/useBrainDump';

type Tab = 'character' | 'quests' | 'dashboard';

interface AppContextType {
  // Dashboard State
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  user: UserStats;
  achievements: Achievement[];
  latestDump: { summary: string; anxietyLevel: string; anxietyScore: number } | null;
  burnoutMonitor: BurnoutPrediction | null;
  expPopups: {id: string, exp: number}[];
  setExpPopups: React.Dispatch<React.SetStateAction<{id: string, exp: number}[]>>;
  fetchData: () => Promise<void>;
  recentlyCompletedIds: string[];
  updateProfile: (data: Partial<UserStats>, silent?: boolean) => Promise<void>;
  resetProfile: () => Promise<void>;
  nudge: { optimalHour: number; suggestion: string } | null;
  isLoading: boolean;
  
  // Quest State
  selectedGoal: Goal | null;
  setSelectedGoal: React.Dispatch<React.SetStateAction<Goal | null>>;
  isQuestEditorOpen: boolean;
  setIsQuestEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  questToDelete: string | null;
  setQuestToDelete: React.Dispatch<React.SetStateAction<string | null>>;
  questToEdit: Goal | null;
  setQuestToEdit: React.Dispatch<React.SetStateAction<Goal | null>>;
  handleLogAction: (goalId: string) => Promise<void>;
  handleSaveQuest: (data: Partial<Goal>) => Promise<void>;
  confirmDeleteQuest: (goalId: string) => void;
  executeDeleteQuest: (setGoals: React.Dispatch<React.SetStateAction<Goal[]>>) => Promise<void>;

  // Brain Dump State
  isBrainDumpOpen: boolean;
  setIsBrainDumpOpen: React.Dispatch<React.SetStateAction<boolean>>;
  draftContent: string;
  setDraftContent: React.Dispatch<React.SetStateAction<string>>;
  isAnalyzing: boolean;
  handleBrainDump: () => Promise<void>;
  analysisResult: any;

  // Global Modals State
  isProfileOpen: boolean;
  setIsProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const dashboardState = useDashboardState();
  const questState = useQuest(dashboardState.goals, dashboardState.fetchData, dashboardState.setExpPopups);
  const brainDumpState = useBrainDump(dashboardState.fetchData);

  return (
    <AppContext.Provider value={{
      isProfileOpen, setIsProfileOpen,
      isSettingsOpen, setIsSettingsOpen,
      ...dashboardState,
      ...questState,
      ...brainDumpState
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
