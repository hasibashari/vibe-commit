import { create } from 'zustand';

interface UIState {
  isProfileOpen: boolean;
  setIsProfileOpen: (isOpen: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  isQuestEditorOpen: boolean;
  setIsQuestEditorOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isProfileOpen: false,
  setIsProfileOpen: (isOpen) => set({ isProfileOpen: isOpen }),
  isSettingsOpen: false,
  setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  isQuestEditorOpen: false,
  setIsQuestEditorOpen: (isOpen) => set({ isQuestEditorOpen: isOpen }),
}));
