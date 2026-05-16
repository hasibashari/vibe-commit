import React, { createContext, useContext, ReactNode } from 'react';
import { useQuest } from '../../features/quests/hooks/useQuest';
import { useDashboardContext } from './DashboardProvider';

const QuestContext = createContext<ReturnType<typeof useQuest> | undefined>(undefined);

export function QuestProvider({ children }: { children: ReactNode }) {
  const { goals, fetchData, setExpPopups } = useDashboardContext();
  const state = useQuest(goals, fetchData, setExpPopups);
  return <QuestContext.Provider value={state}>{children}</QuestContext.Provider>;
}

export function useQuestContext() {
  const context = useContext(QuestContext);
  if (context === undefined) {
    throw new Error('useQuestContext must be used within QuestProvider');
  }
  return context;
}
