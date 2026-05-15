import React from 'react';
import { Send, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import { useAIChat } from '../hooks/useAIChat';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  goals?: any[];
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, user, goals }) => {
  const { messages, input, setInput, isTyping, messagesEndRef, handleSend, clearChat } = useAIChat(isOpen, user, goals);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-0 flex flex-col h-[600px] max-h-[85dvh]"
    >
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-slate-800/20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 rounded-md">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-200">AI Companion</h3>
            <p className="text-xs text-cyan-400 font-mono tracking-wider">ONLINE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800"
            title="Kosongkan Obrolan"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700/50 rounded-xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-slate-900/50 shrink-0">
        <div className="flex items-end gap-2 bg-slate-800/50 border border-white/5 rounded-xl p-1 focus-within:border-cyan-500/50 focus-within:bg-slate-800/80 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ngobrol sama AI..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 p-2.5 resize-none max-h-32 min-h-[44px] outline-none"
            rows={1}
          />
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2.5 flex-shrink-0 mb-0.5 mr-0.5 rounded-lg h-auto"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" /> AI bisa membuat kesalahan.
            </p>
        </div>
      </div>
    </Modal>
  );
};

