import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardProvider } from './DashboardProvider';
import { QuestProvider } from './QuestProvider';
import { BrainDumpProvider } from './BrainDumpProvider';

interface AppContextType {
  isProfileOpen: boolean;
  setIsProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <AppContext.Provider value={{
      isProfileOpen, setIsProfileOpen,
      isSettingsOpen, setIsSettingsOpen,
    }}>
      <DashboardProvider>
        <QuestProvider>
          <BrainDumpProvider>
            {children}
          </BrainDumpProvider>
        </QuestProvider>
      </DashboardProvider>
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

