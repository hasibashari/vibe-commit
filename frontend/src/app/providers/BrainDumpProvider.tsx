import React, { createContext, useContext, ReactNode } from 'react';
import { useBrainDump } from '../../features/brainDump/hooks/useBrainDump';
import { useDashboardContext } from './DashboardProvider';

const BrainDumpContext = createContext<ReturnType<typeof useBrainDump> | undefined>(undefined);

export function BrainDumpProvider({ children }: { children: ReactNode }) {
  const { fetchData } = useDashboardContext();
  const state = useBrainDump(fetchData);
  return <BrainDumpContext.Provider value={state}>{children}</BrainDumpContext.Provider>;
}

export function useBrainDumpContext() {
  const context = useContext(BrainDumpContext);
  if (context === undefined) {
    throw new Error('useBrainDumpContext must be used within BrainDumpProvider');
  }
  return context;
}
