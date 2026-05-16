import { useState } from 'react';
import { analyzeBrainDump } from '../../../shared/services/aiService';
import { saveBrainDumpApi, saveQuestsFromBrainDumpApi } from '../services/brainDumpApi';
import { useToast } from '../../../shared/components/Toast';

export function useBrainDump(fetchData: () => Promise<void>) {
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const handleBrainDump = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeBrainDump(draftContent);
      
      await saveBrainDumpApi(draftContent, result);
      await saveQuestsFromBrainDumpApi(result.quests);
      
      setAnalysisResult(result);
      fetchData();
      
      toast({
        title: "Analisis Berhasil",
        description: `Ditemukan ${result.quests.length} quest dari pemikiranmu.`,
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
      setIsAnalyzing(false);
    }
  };

  const handleChangeBrainDumpState = (open: boolean) => {
    if (open) {
      setIsBrainDumpOpen(true);
    } else if (!isAnalyzing) {
      setIsBrainDumpOpen(false);
      if (analysisResult) {
        setDraftContent('');
      }
      setAnalysisResult(null);
    }
  };

  return {
    isBrainDumpOpen,
    setIsBrainDumpOpen: handleChangeBrainDumpState,
    draftContent,
    setDraftContent,
    isAnalyzing,
    analysisResult,
    handleBrainDump
  };
}
