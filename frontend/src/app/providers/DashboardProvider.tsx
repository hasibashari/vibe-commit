import React, { createContext, useContext, ReactNode } from 'react';
import { useDashboardState } from '../../features/dashboard/hooks/useDashboardState';

const DashboardContext = createContext<ReturnType<typeof useDashboardState> | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const state = useDashboardState();
  return <DashboardContext.Provider value={state}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within DashboardProvider');
  }
  return context;
}
