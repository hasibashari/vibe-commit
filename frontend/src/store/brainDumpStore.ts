import { create } from 'zustand';
import { analyzeBrainDump, BrainDumpAnalysis } from '../shared/services/aiService';
import type { Goal } from '../shared/types/goal';
import { saveBrainDumpApi, saveQuestsFromBrainDumpApi } from '../features/brainDump/services/brainDumpApi';
import { useToastStore } from './toastStore';
import { useDashboardStore } from './dashboardStore';
import { useUIStore } from './uiStore';

interface BrainDumpStore {
  draftContent: string;
  setDraftContent: (content: string) => void;
  isAnalyzing: boolean;
  analysisResult: BrainDumpAnalysis | null;
  setAnalysisResult: (result: BrainDumpAnalysis | null) => void;

  handleBrainDump: () => Promise<void>;
  handleChangeBrainDumpState: (open: boolean) => void;
}

export const useBrainDumpStore = create<BrainDumpStore>((set, get) => ({
  draftContent: '',
  setDraftContent: (content) => set({ draftContent: content }),
  isAnalyzing: false,
  analysisResult: null,
  setAnalysisResult: (result) => set({ analysisResult: result }),

  handleBrainDump: async () => {
    const { draftContent } = get();
    const { goals, recalculateState, user, updateProfile } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();

    // Zero-Mana Exploit Protection
    if ((user?.mana ?? 0) < 20) {
      toast({
        title: "Mana Tidak Cukup",
        description: "Brain Dump butuh 20 Mana.",
        type: 'error'
      });
      return;
    }

    let newGoals: Goal[] = [];
    set({ isAnalyzing: true });
    try {
      // Deduct Mana
      await updateProfile({ mana: Math.max(0, (user.mana || 0) - 20) }, true);

      const result = await analyzeBrainDump(draftContent);
      
      // Optimistic update of local goals
      newGoals = (result.quests || []).map((q) => ({
        id: crypto.randomUUID(),
        title: q.title,
        description: q.description || null,
        difficulty: q.difficulty || 1.0,
        reward_alpha: q.rewardAlpha || 0.5,
        category: q.category || null,
        created_at: new Date().toISOString(),
        repetition_count: 0,
        logs: [],
        user_id: user?.id || ''
      }) as Goal);
      
      const updatedGoals = [...goals, ...newGoals];
      recalculateState(updatedGoals);

      // Async DB write
      await saveBrainDumpApi(draftContent, result);
      await saveQuestsFromBrainDumpApi(newGoals);
      
      set({ analysisResult: result });
      
      toast({
        title: "Analisis Berhasil",
        description: `Ditemukan ${result?.quests?.length || 0} quest dari pemikiranmu.`,
        type: 'success'
      });
      
    } catch (e: unknown) {
      // Refund Mana
      const { user, updateProfile } = useDashboardStore.getState();
      await updateProfile({ mana: (user.mana || 0) + 20 }, true);

      // Revert optimistic updates
      recalculateState(useDashboardStore.getState().goals.filter(g => !newGoals?.find(ng => ng.id === g.id)));
      
      console.error(e);
      let desc = "Terjadi kesalahan saat memproses data.";
      if (e instanceof Error) desc = e.message;
      toast({
        title: "Gagal Menganalisis",
        description: desc,
        type: 'error'
      });
    } finally {
      set({ isAnalyzing: false });
    }
  },

  handleChangeBrainDumpState: (open: boolean) => {
    const { isAnalyzing, analysisResult } = get();
    const { setIsBrainDumpOpen } = useUIStore.getState();
    
    if (open) {
      setIsBrainDumpOpen(true);
    } else if (!isAnalyzing) {
      setIsBrainDumpOpen(false);
      if (analysisResult) {
        set({ draftContent: '' });
      }
      set({ analysisResult: null });
    }
  }
}));
