import { useState } from 'react';
import { Sparkles, Save, Loader2, ArrowRight } from 'lucide-react';
import type { Goal } from '../../../shared/types/goal';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { getAuthHeaders } from '../../../shared/services/session';

interface AiQuestChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questData: Partial<Goal>) => void;
}

export const AiQuestChatModal: React.FC<AiQuestChatModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewQuest, setPreviewQuest] = useState<Partial<Goal> | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setPreviewQuest(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error('Failed to generate quest');
      const data = await res.json();
      setPreviewQuest({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        reward_alpha: data.rewardAlpha,
        category: data.category,
        type: data.type,
      });
    } catch (error) {
      console.error(error);
      alert('Gagal membuat quest dengan AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (previewQuest) {
      onSave(previewQuest);
      setPrompt('');
      setPreviewQuest(null);
      onClose();
    }
  };

  const handleClose = () => {
    setPrompt('');
    setPreviewQuest(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='✨ Buat Quest dengan AI'>
      <div className='p-4 sm:p-6 space-y-6 bg-slate-950/10'>

        {/* Chat Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder='Contoh: Buatkan quest untuk belajar AI dan Machine Learning'
              className='bg-slate-900 border-slate-800/80 focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 hover:border-slate-700 transition-all text-white shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.4)] rounded-xl'
              onKeyDown={e => {
                if (e.key === 'Enter') handleGenerate();
              }}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-none rounded-xl px-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </Button>
        </div>

        {/* Preview Area */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-purple-400 gap-3">
            <Sparkles className="w-8 h-8 animate-pulse" />
            <span className="text-sm font-mono animate-pulse">AI sedang berpikir...</span>
          </div>
        )}

        {previewQuest && !isLoading && (
          <div className="p-4 bg-slate-900/50 border border-purple-500/30 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-lg text-white">{previewQuest.title}</h4>
                <p className="text-sm text-slate-400 mt-1">{previewQuest.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/50">
              <span className="text-xs font-mono px-2 py-1 bg-slate-800 rounded-md text-slate-300">
                Difficulty: {previewQuest.difficulty}
              </span>
              <span className="text-xs font-mono px-2 py-1 bg-slate-800 rounded-md text-slate-300">
                Reward: {previewQuest.reward_alpha}x
              </span>
              <span className="text-xs font-mono px-2 py-1 bg-slate-800 rounded-md text-slate-300">
                Category: {previewQuest.category}
              </span>
              <span className="text-xs font-mono px-2 py-1 bg-slate-800 rounded-md text-slate-300 capitalize">
                Type: {previewQuest.type}
              </span>
            </div>
          </div>
        )}

      </div>

      <div className='border-t border-white/5 px-4 sm:px-6 py-4 bg-slate-950/80 flex justify-end gap-3'>
        <Button variant='ghost' onClick={handleClose} className='hover:bg-white/5 text-slate-400'>
          Batal
        </Button>
        <Button
          variant='primary'
          onClick={handleSave}
          disabled={!previewQuest || isLoading}
          className='gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 rounded-xl px-6 border-none'
        >
          <Save className='w-4 h-4' />
          Simpan Quest
        </Button>
      </div>
    </Modal>
  );
};
