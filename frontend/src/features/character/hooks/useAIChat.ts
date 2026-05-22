import { useState, useCallback, useRef, useEffect } from 'react';
import { chatWithAI } from '../../../shared/services/aiService';

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

    const userMessage = input.trim();
    setInput('');
    const newMessages: { role: 'user' | 'model', content: string }[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const activeGoals = goals?.filter(g => g.status !== 'completed' && g.status !== 'archived').map(g => g.title).join(', ') || 'Belum ada quest aktif.';
      
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
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, user, goals]);

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

