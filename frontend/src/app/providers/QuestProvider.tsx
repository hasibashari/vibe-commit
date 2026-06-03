import { ReactNode } from 'react';
import { useQuestStore } from '../../store/questStore';
import { useUIStore } from '../../store/uiStore';

export function QuestProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useQuestContext() {
  const questState = useQuestStore();
  const isQuestEditorOpen = useUIStore((state) => state.isQuestEditorOpen);
  const setIsQuestEditorOpen = useUIStore((state) => state.setIsQuestEditorOpen);
  const isAiQuestModalOpen = useUIStore((state) => state.isAiQuestModalOpen);
  const setIsAiQuestModalOpen = useUIStore((state) => state.setIsAiQuestModalOpen);

  // Merge the UI state that was previously in useQuest hook into the returned object to preserve component compat
  return {
    ...questState,
    isQuestEditorOpen,
    setIsQuestEditorOpen,
    isAiQuestModalOpen,
    setIsAiQuestModalOpen
  };
}
