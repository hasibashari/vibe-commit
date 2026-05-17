import { useState, useCallback, useRef, useEffect } from 'react';
import { chatWithAI } from '../../../shared/services/aiService';
import { useDashboardStore } from '../../../store/dashboardStore';
import { useToastStore } from '../../../store/toastStore';

import type { Goal } from '../../../shared/types/goal';
import type { UserStats } from '../../../shared/types/user';

const CHAT_HISTORY_KEY = 'ai_chat_history';

export function useAIChat(isOpen: boolean, user: UserStats, goals?: Goal[]) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>(() => {
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const updateProfile = useDashboardStore(state => state.updateProfile);
  const toast = useToastStore(state => state.toast);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'model', content: `Hei ${user?.name || 'Petualang'}! Ada yang bisa kubantu hari ini?` }
      ]);
    }
  }, [isOpen, user?.name, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;
    
    // Zero-Mana Exploit Protection
    if ((user?.mana ?? 0) < 5) {
      toast({
        title: "Mana Tidak Cukup",
        description: "Kamu butuh minimal 5 Mana untuk berbicara dengan AI.",
        type: 'error'
      });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    const newMessages: { role: 'user' | 'model', content: string }[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Deduct Mana
      await updateProfile({ mana: Math.max(0, (user.mana || 0) - 5) }, true);

      const activeGoals = goals?.filter(g => g.status !== 'completed').map(g => g.title).join(', ') || 'Belum ada quest aktif.';
      
      const response = await chatWithAI(newMessages, {
        userName: user?.name,
        level: user?.level,
        hp: user?.hp,
        mana: user?.mana,
        activeQuests: activeGoals
      });
      setMessages([...newMessages, { role: 'model', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'model', content: 'Maaf, sistemku sedang nge-lag. Bisa diulangi?' }]);
      // Refund Mana on failure
      await updateProfile({ mana: (user.mana || 0) }, true);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, user, goals, updateProfile, toast]);

  const clearChat = useCallback(() => {
    setMessages([
      { role: 'model', content: `Hei ${user?.name || 'Petualang'}! Ada yang bisa kubantu hari ini?` }
    ]);
  }, [user?.name]);

  return {
    messages,
    input,
    setInput,
    isTyping,
    messagesEndRef,
    handleSend,
    clearChat
  };
}

