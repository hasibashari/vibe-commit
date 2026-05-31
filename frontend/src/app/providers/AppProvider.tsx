import { ReactNode } from 'react';
import { DashboardProvider } from './DashboardProvider';
import { QuestProvider } from './QuestProvider';
import { useUIStore } from '../../store/uiStore';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <QuestProvider>
        {children}
      </QuestProvider>
    </DashboardProvider>
  );
}

export function useAppContext() {
  const isProfileOpen = useUIStore((state) => state.isProfileOpen);
  const setIsProfileOpen = useUIStore((state) => state.setIsProfileOpen);
  const isSettingsOpen = useUIStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useUIStore((state) => state.setIsSettingsOpen);

  return {
    isProfileOpen,
    setIsProfileOpen,
    isSettingsOpen,
    setIsSettingsOpen,
  };
}

