import React, { ReactNode } from 'react';
import { useBrainDumpStore } from '../../store/brainDumpStore';
import { useUIStore } from '../../store/uiStore';

export function BrainDumpProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useBrainDumpContext() {
  const storeState = useBrainDumpStore();
  const isBrainDumpOpen = useUIStore((state) => state.isBrainDumpOpen);
  
  return {
    ...storeState,
    isBrainDumpOpen,
    setIsBrainDumpOpen: storeState.handleChangeBrainDumpState
  };
}
