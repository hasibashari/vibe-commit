import { useState, useEffect, MouseEvent as ReactMouseEvent } from 'react';

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Pagi";
  if (hour >= 12 && hour < 15) return "Siang";
  if (hour >= 15 && hour < 18) return "Sore";
  return "Malam";
};

import type { Goal } from '../../../shared/types/goal';

export const getDynamicQuotes = (
  hp: number,
  mana: number,
  goals?: Goal[],
  nudge?: { optimalHour: number; suggestion: string } | null,
  userName?: string
) => {
  const quotes = [];
  const greeting = getTimeGreeting();
  const namePrefix = userName ? ` ${userName}` : '';
  
  if (!goals || goals.length === 0) {
    quotes.push(`Selamat ${greeting}${namePrefix}! Sistem berada pada kondisi awal. Mari kita mulai mendaftarkan Quest-mu!`);
    quotes.push("Belum ada target yang ditentukan. Coba gunakan fitur Brain Dump di bawah kalau merasa kewalahan.");
    quotes.push("Siap untuk memulai petualangan baru hari ini? Tambahkan quest di panel sebelah.");
    return quotes;
  }

  if (nudge && nudge.suggestion) {
    quotes.push(`Insight: ${nudge.suggestion}`);
  }

  const activeGoals = goals.filter(g => g.repetition_count > 0).length;
  
  if (activeGoals > 0) {
    quotes.push(`Selamat ${greeting}${namePrefix}! Kamu sedang aktif menjalankan ${activeGoals} quest. Let's get things done!`);
  } else {
    quotes.push(`Selamat ${greeting}${namePrefix}! Ada quest utama yang belum disentuh lho. Mau mulai sekarang?`);
  }

  if (hp < 50) {
    quotes.push("Warning: Stamina (HP) kamu mulai turun. Mungkin butuh peregangan atau break sebentar?");
  } else if (hp === 100) {
    quotes.push("Stamina penuh 100%! Kamu dalam kondisi puncak untuk mengambil task yang berat.");
  }

  if (mana < 30) {
    quotes.push("Fokus (Mana) hampir habis. Jangan memaksakan diri, risiko burnout meningkat. Waktunya istirahat.");
  } else if (mana > 80) {
    quotes.push("Fokus (Mana) masih sangat tajam. Waktu yang tepat untuk masuk sesi deep work.");
  }

  quotes.push("Jangan lupa review quest harianmu. Progres kecil setiap hari akan membuahkan hasil besar.");
  quotes.push("Kalau ngerasa stuck, break down quest-nya jadi langkah-langkah yang jauh lebih kecil.");

  return quotes;
};

export function useDynamicQuotes(
  hp: number,
  mana: number,
  goals?: Goal[],
  nudge?: { optimalHour: number; suggestion: string } | null,
  userName?: string
) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const activeGoals = goals?.filter(g => g.status !== 'archived');
  const dynamicQuotes = getDynamicQuotes(hp, mana, activeGoals, nudge, userName);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % dynamicQuotes.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [dynamicQuotes.length]);

  return {
    dynamicQuotes,
    quoteIndex: quoteIndex % dynamicQuotes.length
  };
}

export function useEasterEgg() {
  const [tapCount, setTapCount] = useState(0);
  const [overrideQuote, setOverrideQuote] = useState<string | null>(null);

  useEffect(() => {
    if (tapCount === 0) return;

    let msg = null;
    if (tapCount === 3) msg = "Eh, kenapa tap-tap?";
    else if (tapCount === 8) msg = "Woi! Jangan di tap-tap terus, geli tau!";
    else if (tapCount === 15) msg = "Buset dah, lo gabut apa gimana nih?";
    else if (tapCount === 25) msg = "😡 UDAH WOYY! Selesaikan quest lo sana!";

    if (msg) {
      setOverrideQuote(msg);
    }

    const timer = setTimeout(() => {
      setTapCount(0);
      setOverrideQuote(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [tapCount]);

  const handleCharacterTap = (e: ReactMouseEvent) => {
    e.stopPropagation();
    setTapCount(prev => prev + 1);
  };

  return { overrideQuote, tapCount, handleCharacterTap };
}

export function useTypingEffect(currentQuote: string) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let i = 0;
    
    setDisplayedText("");
    setIsTyping(true);

    const typeWriter = () => {
      if (i < currentQuote.length) {
        setDisplayedText(currentQuote.slice(0, i + 1));
        i++;
        const randomSpeed = Math.floor(Math.random() * 30) + 20; 
        timeoutId = setTimeout(typeWriter, randomSpeed);
      } else {
        setIsTyping(false);
      }
    };

    timeoutId = setTimeout(typeWriter, 300);

    return () => clearTimeout(timeoutId);
  }, [currentQuote]);

  return { displayedText, isTyping };
}
