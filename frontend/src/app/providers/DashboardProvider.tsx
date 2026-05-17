import React, { ReactNode } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';

export function DashboardProvider({ children }: { children: ReactNode }) {
  // fetching is now controlled by App.tsx observing auth state
  return <>{children}</>;
}

export function useDashboardContext() {
  const state = useDashboardStore();
  return state;
}
