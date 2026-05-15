import { useState, useCallback, useRef, useEffect } from 'react';
import { chatWithAI } from '../../../shared/services/vibeService';

export function useAIChat(isOpen: boolean, user: any) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'model', content: `Hei ${user?.name || 'Petualang'}! Ada yang bisa kubantu hari ini?` }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
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
  }, [input, isTyping, messages, user]);

  return {
    messages,
    input,
    setInput,
    isTyping,
    messagesEndRef,
    handleSend
  };
}
