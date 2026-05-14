import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, AlertCircle, Bot } from 'lucide-react';
import { chatWithAI } from '../../../shared/services/vibeService';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with a greeting
      setMessages([
        { role: 'model', content: `Hei ${user?.name || 'Petualang'}! Ada yang bisa kubantu hari ini?` }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await chatWithAI(newMessages, {
        userName: user?.name,
        level: user?.level,
        hp: user?.hp,
        mana: user?.mana
      });
      setMessages([...newMessages, { role: 'model', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'model', content: 'Maaf, sistemku sedang nge-lag. Bisa diulangi?' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 pt-[10%]"
          />
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-700/50 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col pointer-events-auto h-[600px] max-h-[80vh] overflow-hidden"
            >
              <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800/80 bg-slate-800/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/10 rounded-md">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-200">AI Companion</h3>
                    <p className="text-[10px] text-cyan-400 font-mono tracking-wider">ONLINE</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
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

              <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
                <div className="flex items-end gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 focus-within:border-cyan-500/50 focus-within:bg-slate-800/80 transition-colors">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ngobrol sama AI..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 p-2.5 resize-none max-h-32 min-h-[44px]"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white rounded-lg transition-colors flex-shrink-0 mb-0.5 mr-0.5"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 text-center">
                   <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" /> AI bisa membuat kesalahan.
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
