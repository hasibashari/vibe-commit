import { create } from 'zustand';
import { analyzeBrainDump } from '../shared/services/aiService';
import { saveBrainDumpApi, saveQuestsFromBrainDumpApi } from '../features/brainDump/services/brainDumpApi';
import { useToastStore } from './toastStore';
import { useDashboardStore } from './dashboardStore';
import { useUIStore } from './uiStore';

interface BrainDumpStore {
  draftContent: string;
  setDraftContent: (content: string) => void;
  isAnalyzing: boolean;
  analysisResult: any;
  setAnalysisResult: (result: any) => void;

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
    const { fetchData } = useDashboardStore.getState();
    const { toast } = useToastStore.getState();

    set({ isAnalyzing: true });
    try {
      const result = await analyzeBrainDump(draftContent);
      
      await saveBrainDumpApi(draftContent, result);
      await saveQuestsFromBrainDumpApi(result.quests);
      
      set({ analysisResult: result });
      await fetchData();
      
      toast({
        title: "Analisis Berhasil",
        description: `Ditemukan ${result?.quests?.length || 0} quest dari pemikiranmu.`,
        type: 'success'
      });
      
    } catch (e: unknown) {
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
