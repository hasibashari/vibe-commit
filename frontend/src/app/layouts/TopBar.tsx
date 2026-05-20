import React from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Zap,
  Star,
  Shield,
  Sword,
  Swords,
  Crown,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAudio } from '../providers/AudioProvider';
import { Button } from '../../shared/components/Button';

import type { UserStats } from '../../shared/types/user';

interface TopBarProps {
  hp: number;
  mana: number;
  level: number;
  exp: number;
  coins: number;
  user?: UserStats;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

function getExpNeededForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

export const TopBar: React.FC<TopBarProps> = ({
  hp,
  mana,
  level,
  exp,
  coins,
  user,
  onOpenProfile,
  onOpenSettings,
}) => {
  const { isMuted, toggleMute } = useAudio();
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const probeTimerRef = React.useRef<number | null>(null);

  const runConnectionProbe = React.useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }

    const probeUrl =
      import.meta.env.VITE_CONNECTIVITY_PROBE_URL || 'https://www.google.com/generate_204';

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2500);

    try {
      await fetch(probeUrl, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });

      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      runConnectionProbe();
    };
    const handleOffline = () => setIsOnline(false);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        runConnectionProbe();
      }
    };

    runConnectionProbe();

    probeTimerRef.current = window.setInterval(() => {
      if (!document.hidden) {
        runConnectionProbe();
      }
    }, 15000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', runConnectionProbe);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', runConnectionProbe);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (probeTimerRef.current !== null) {
        window.clearInterval(probeTimerRef.current);
      }
    };
  }, [runConnectionProbe]);

  const avatarColorMap: Record<string, { from: string; text: string }> = {
    indigo: { from: 'from-indigo-500/20', text: 'text-indigo-400' },
    rose: { from: 'from-rose-500/20', text: 'text-rose-400' },
    cyan: { from: 'from-accent-500/20', text: 'text-accent-400' },
    emerald: { from: 'from-emerald-500/20', text: 'text-emerald-400' },
    amber: { from: 'from-amber-500/20', text: 'text-amber-400' },
  };

  const cColor = user?.avatar_color || 'indigo';
  const colorClasses = avatarColorMap[cColor] || avatarColorMap.indigo;

  const getIcon = (iconName: string, className: string) => {
    switch (iconName?.toLowerCase()) {
      case 'sword':
        return <Sword className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'swords':
        return <Swords className={className} />;
      case 'star':
        return <Star className={className} />;
      case 'crown':
        return <Crown className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  const avatarIcon = user?.avatar_icon || 'Shield';

  return (
    <header className='sticky top-0 z-50 transition-all duration-300 w-full bg-surface/95 backdrop-blur-md border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between px-4 pb-3 pt-[max(env(safe-area-inset-top,0px),0.75rem)] md:px-6 shadow-sm gap-4 lg:gap-0'>
      {/* Left: User / Level Info */}
      <div className='flex items-center justify-between lg:justify-start w-full lg:w-auto gap-4'>
        <div className='flex items-center gap-3'>
          <button
            onClick={onOpenProfile}
            className='relative w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shadow-inner group hover:border-slate-400 transition-colors shrink-0'
          >
            <div
              className={`absolute inset-0 bg-linear-to-tr ${colorClasses.from} to-purple-500/20`}
            ></div>
            {getIcon(
              avatarIcon,
              `w-5 h-5 md:w-6 md:h-6 ${colorClasses.text} group-hover:scale-110 transition-transform`,
            )}
          </button>

          <div className='flex flex-col'>
            <button
              onClick={onOpenProfile}
              className='font-display text-sm md:text-base font-bold text-white tracking-wide text-left hover:text-accent-400 transition-colors'
            >
              {user?.name || 'Player_One'}
            </button>
            <span className='text-xs font-mono text-slate-400 uppercase tracking-widest'>
              {user?.title || 'Novice Operative'}
            </span>
          </div>
        </div>

        {/* Mobile Settings/Coins row - hidden on desktop */}
        <div className='flex lg:hidden items-center gap-2'>
          {/* Connection status badge - Mobile */}
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all shrink-0 ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {isOnline ? (
              <Wifi className='w-4 h-4 animate-pulse' />
            ) : (
              <WifiOff className='w-4 h-4' />
            )}
          </div>

          <div className='flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-md border border-white/10'>
            <Star className='w-3.5 h-3.5 text-amber-400' fill='currentColor' />
            <span className='text-xs font-mono font-bold text-amber-400'>{coins || 0}</span>
          </div>
          <Button
            variant='secondary'
            size='icon'
            onClick={toggleMute}
            className='w-8 h-8 rounded-lg p-0!'
          >
            {isMuted ? (
              <VolumeX className='w-4 h-4' />
            ) : (
              <Volume2 className='w-4 h-4 text-cyan-400' />
            )}
          </Button>
          <Button
            variant='secondary'
            size='icon'
            onClick={onOpenSettings}
            className='w-8 h-8 rounded-lg p-0!'
          >
            <Settings className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Right: RPG Stats */}
      <div className='flex items-center justify-between lg:justify-end gap-4 lg:gap-6 w-full lg:w-auto'>
        {/* EXP Bar */}
        {(() => {
          const expNeeded = getExpNeededForLevel(level ?? 1);
          const expPercent = ((exp ?? 0) / expNeeded) * 100;
          return (
            <div className='flex flex-col gap-1 min-w-[80px] flex-1 lg:flex-none lg:w-32'>
              <div className='flex justify-between items-center text-xs font-bold tracking-widest uppercase'>
                <span className='text-amber-400'>Lv {level ?? 1}</span>
                <span className='text-slate-400'>
                  {expPercent.toFixed(0)} <span className='text-slate-600'>%</span>
                </span>
              </div>
              <div className='w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-px'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, expPercent))}%` }}
                  className='h-full bg-amber-400 rounded-full'
                ></motion.div>
              </div>
            </div>
          );
        })()}

        {/* HP Bar */}
        <div className='flex flex-col gap-1 min-w-[80px] flex-1 lg:flex-none lg:w-32'>
          <div className='flex justify-between items-center text-xs font-bold tracking-widest uppercase'>
            <span className='text-emerald-400 flex items-center gap-1'>
              <Heart className='w-3 h-3' fill='currentColor' /> HP
            </span>
            <span className='text-slate-200'>{(hp ?? 100).toFixed(0)}</span>
          </div>
          <div className='w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, hp ?? 100))}%` }}
              className='h-full bg-linear-to-r from-emerald-500 to-emerald-400'
            ></motion.div>
          </div>
        </div>

        {/* MP Bar */}
        <div className='flex flex-col gap-1 min-w-[80px] flex-1 lg:flex-none lg:w-32'>
          <div className='flex justify-between items-center text-xs font-bold tracking-widest uppercase'>
            <span className='text-accent-400 flex items-center gap-1'>
              <Zap className='w-3 h-3' fill='currentColor' /> MP
            </span>
            <span className='text-slate-200'>{(mana ?? 100).toFixed(0)}</span>
          </div>
          <div className='w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, mana ?? 100))}%` }}
              className='h-full bg-linear-to-r from-cyan-500 to-cyan-400'
            ></motion.div>
          </div>
        </div>

        {/* Coins/Points - Desktop */}
        <div className='hidden lg:flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-md border border-white/10 shrink-0'>
          <Star className='w-3.5 h-3.5 text-amber-400' fill='currentColor' />
          <span className='text-xs font-mono font-bold text-amber-400'>{coins || 0}</span>
        </div>

        <div className='hidden lg:flex items-center gap-2 shrink-0'>
          {/* Connection status badge - Desktop */}
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {isOnline ? (
              <Wifi className='w-5 h-5 animate-pulse' />
            ) : (
              <WifiOff className='w-5 h-5' />
            )}
          </div>

          <Button
            variant='secondary'
            size='icon'
            onClick={toggleMute}
            className='w-8 h-8 rounded-lg p-0!'
          >
            {isMuted ? (
              <VolumeX className='w-4 h-4' />
            ) : (
              <Volume2 className='w-4 h-4 text-cyan-400' />
            )}
          </Button>

          {/* Settings - Desktop */}
          <Button
            variant='secondary'
            size='icon'
            onClick={onOpenSettings}
            className='w-8 h-8 rounded-lg p-0!'
          >
            <Settings className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </header>
  );
};
