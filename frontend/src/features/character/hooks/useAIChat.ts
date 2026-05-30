import { useState, useCallback, useRef, useEffect } from 'react';
import { chatWithAI } from '../../../shared/services/aiService';

import type { Goal } from '../../../shared/types/goal';
import type { UserStats } from '../../../shared/types/user';

const CHAT_STATE_KEY = 'ai_chat_state_v2';

interface StoredChatState {
  hp: number;
  mana: number;
  messages: { role: 'user' | 'model'; content: string }[];
}

export function useAIChat(isOpen: boolean, user: UserStats, goals?: Goal[]) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>(() => {
    try {
      const stored = localStorage.getItem(CHAT_STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredChatState;
        return parsed.messages || [];
      }
    } catch {
      // ignore
    }
    return [];
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-clear chat history if user stats (HP/Mana) have changed to prevent stale AI context
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(CHAT_STATE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as StoredChatState;
          if (parsed.hp !== user.hp || parsed.mana !== user.mana) {
            setMessages([
              { role: 'model', content: `Hei ${user?.name || 'Petualang'}! Ada yang bisa kubantu hari ini?` }
            ]);
            localStorage.removeItem(CHAT_STATE_KEY);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen, user.hp, user.mana, user?.name]);

  useEffect(() => {
    if (messages.length > 0) {
      const state: StoredChatState = {
        hp: user.hp,
        mana: user.mana,
        messages
      };
      localStorage.setItem(CHAT_STATE_KEY, JSON.stringify(state));
    }
  }, [messages, user.hp, user.mana]);

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
    try {
      localStorage.removeItem(CHAT_STATE_KEY);
    } catch (e) {}
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

