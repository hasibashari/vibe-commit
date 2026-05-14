import { useState } from 'react';
import { analyzeBrainDump } from '../../../shared/services/vibeService';

export function useBrainDump(fetchData: () => Promise<void>) {
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleBrainDump = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeBrainDump(draftContent);
      
      await fetch('/api/brain-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          userId: 'user123',
          rawContent: draftContent,
          analysis: {
            anxietyLevel: result.anxietyLevel,
            anxietyScore: result.anxietyScore,
            summary: result.analysisSummary
          }
        })
      });

      for (const res of result.quests) {
        await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            userId: 'user123',
            title: res.title,
            description: res.description,
            difficulty: res.difficulty,
            rewardAlpha: res.rewardAlpha,
            category: res.category,
            isExperimental: false
          })
        });
      }
      
      setAnalysisResult(result);
      fetchData();
      
      // Auto close after 3 seconds of showing results
      setTimeout(() => {
        setIsBrainDumpOpen(false);
        setDraftContent('');
        setAnalysisResult(null);
      }, 4000);
      
    } catch (e: any) {
      console.error(e);
      alert("Error processing brain dump: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChangeBrainDumpState = (open: boolean) => {
    if (open) {
      setIsBrainDumpOpen(true);
    } else if (!isAnalyzing) {
      setIsBrainDumpOpen(false);
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
