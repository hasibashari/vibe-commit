import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  Zap,
  User,
  Lock,
  Terminal,
  Loader2,
  Cpu,
} from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { useAuthStore } from '../../../store/authStore';

interface FirstTimeOnboardingProps {
  onComplete: () => void;
}

export function FirstTimeOnboarding({ onComplete }: FirstTimeOnboardingProps) {
  const { login, register, loginAsGuest } = useAuthStore();

  // Check if user has already completed onboarding before to skip to login step
  const [step, setStep] = useState(0);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const steps = [
    {
      title: 'SYSTEM AWAKENING',
      text: 'Selamat datang di Nexus. Ini bukan sekadar to-do list biasa, ini adalah sistem pelacak progres hidupmu yang dirancang layaknya RPG.',
      icon: (
        <Zap className='w-12 h-12 text-cyan-400 mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] animate-pulse' />
      ),
      highlight: 'RPG',
    },
    {
      title: 'BRAIN DUMP & AI QUESTS',
      text: 'Pikiranmu sedang kacau? Gunakan fitur Brain Dump. AI akan menganalisis tulisanmu, mengukur tingkat stres, dan menyusunnya menjadi Quest yang bisa dikerjakan.',
      icon: (
        <BrainCircuit className='w-12 h-12 text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]' />
      ),
      highlight: 'Brain Dump',
    },
    {
      title: 'STATUS & BURN OUT',
      text: 'Selesaikan Quest untuk mendapatkan EXP dan naik level. Tapi hati-hati, memaksakan diri tanpa istirahat akan mengurangi HP (Stamina) dan memicu Burnout.',
      icon: (
        <Shield className='w-12 h-12 text-rose-400 mb-4 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]' />
      ),
      highlight: 'Burnout',
    },
    {
      title: 'VIBECOMMIT',
      text: 'Masuk atau daftarkan akun baru Anda untuk memulai petualangan RPG produktivitas secara offline.',
      icon: (
        <Cpu className='w-12 h-12 text-indigo-400 mb-4 drop-shadow-[0_0_15px_rgba(129,140,248,0.6)]' />
      ),
      highlight: 'offline',
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setStep(steps.length - 1);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!username.trim() || !password.trim()) {
      setAuthError('Username dan password tidak boleh kosong');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isRegistering) {
        await register(username, password);
        setIsRegistering(false);
        setPassword('');
      } else {
        await login(username, password);
        onComplete();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setAuthError('');
    setIsSubmitting(true);
    try {
      await loginAsGuest();
      onComplete();
    } catch (err: any) {
      setAuthError(err.message || 'Guest session failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-xl overflow-hidden font-sans select-none'>
      {/* Background visual effects */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center'>
        <div className='w-[1000px] h-[1000px] bg-linear-to-tr from-cyan-900/10 via-transparent to-rose-900/10 rounded-full blur-3xl opacity-50 animate-pulse'></div>
        <div className='absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30'></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className='w-full max-w-md relative z-10'
      >
        <div className='bg-slate-900/80 border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_1px_rgba(255,255,255,0.05)] rounded-2xl p-8 sm:p-10 relative overflow-hidden'>
          {/* Decorative corner borders */}
          <div className='absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-500/30 rounded-tl-xl'></div>
          <div className='absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/30 rounded-tr-xl'></div>
          <div className='absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-500/30 rounded-bl-xl'></div>
          <div className='absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-500/30 rounded-br-xl'></div>

          {/* Top Navigation Back Arrow on last step */}
          {step === 3 && (
            <button
              onClick={handleBack}
              className='absolute top-6 left-6 text-slate-500 hover:text-cyan-400 transition-colors p-1.5 hover:bg-slate-800/40 rounded-lg flex items-center justify-center pointer-events-auto cursor-pointer'
              title='Kembali ke tutorial'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
          )}

          <AnimatePresence mode='wait'>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.4 }}
              className='flex flex-col items-center text-center mt-4'
            >
              {step < 3 ? (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    {steps[step].icon}
                  </motion.div>

                  <h2 className='font-display text-2xl sm:text-3xl font-black text-white tracking-widest uppercase mb-4 mt-2'>
                    {steps[step].title}
                  </h2>

                  <p className='text-slate-400 text-sm sm:text-base leading-relaxed mb-8 min-h-[80px]'>
                    {steps[step].text.split(' ').map((word, i) => (
                      <span
                        key={i}
                        className={
                          steps[step].highlight.includes(word.replace(/[^a-zA-Z]/g, ''))
                            ? 'text-accent-300 font-semibold'
                            : ''
                        }
                      >
                        {word}{' '}
                      </span>
                    ))}
                  </p>
                </>
              ) : (
                <div className='w-full text-left'>
                  {/* Header */}
                  <div className='text-center mb-6'>
                    <div className='inline-flex p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-xl mb-4 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]'>
                      <Cpu className='w-8 h-8 animate-pulse' />
                    </div>
                    <h1 className='text-3xl font-black text-white tracking-widest uppercase mb-1'>
                      VIBE<span className='text-cyan-400'>COMMIT</span>
                    </h1>
                    <p className='text-xs font-mono text-cyan-500/60 uppercase tracking-widest'>
                      Offline Productivity RPG
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleAuthSubmit} className='space-y-4'>
                    <div>
                      <label className='block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2'>
                        Username
                      </label>
                      <div className='relative'>
                        <span className='absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500'>
                          <User className='w-4 h-4' />
                        </span>
                        <input
                          type='text'
                          required
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          placeholder='Username'
                          className='w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 focus:border-cyan-500/80 rounded-xl text-white font-mono text-sm tracking-wider placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-inner'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2'>
                        Password
                      </label>
                      <div className='relative'>
                        <span className='absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500'>
                          <Lock className='w-4 h-4' />
                        </span>
                        <input
                          type='password'
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder='Password'
                          className='w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 focus:border-cyan-500/80 rounded-xl text-white font-mono text-sm tracking-wider placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-inner'
                        />
                      </div>
                    </div>

                    {authError && (
                      <div className='p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg text-rose-400 font-mono text-xs flex gap-2 items-start'>
                        <span className='text-rose-500 animate-pulse font-bold'>[!]</span>
                        <span>{authError}</span>
                      </div>
                    )}

                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className='w-full py-3 bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold tracking-widest uppercase transition-all rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer'
                    >
                      {isSubmitting ? (
                        <Loader2 className='w-4 h-4 animate-spin text-slate-950' />
                      ) : (
                        <>
                          <Terminal className='w-4 h-4' />
                          <span>{isRegistering ? 'REGISTER' : 'LOGIN'}</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className='relative my-5 flex items-center justify-center'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-slate-800/60'></div>
                    </div>
                    <span className='relative px-3 bg-surface text-[10px] font-mono text-slate-500 uppercase tracking-widest'>
                      atau masuk sebagai guest
                    </span>
                  </div>

                  <button
                    onClick={handleGuestLogin}
                    disabled={isSubmitting}
                    type='button'
                    className='w-full py-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-800/30 hover:border-emerald-500/50 text-emerald-400 font-bold tracking-widest uppercase transition-all rounded-xl flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer'
                  >
                    <Zap className='w-4 h-4 text-emerald-400 animate-pulse' />
                    <span>MASUK SEBAGAI GUEST</span>
                  </button>

                  <div className='text-center mt-5'>
                    <button
                      type='button'
                      onClick={() => {
                        setIsRegistering(!isRegistering);
                        setAuthError('');
                      }}
                      className='text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-wider cursor-pointer'
                    >
                      {isRegistering ? 'Sudah punya akun? Login' : 'Belum punya akun? Register'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Stepper & Action for Slides 0, 1, 2 */}
          {step < 3 && (
            <div className='flex flex-col items-center gap-6 mt-4'>
              {/* Slide dots */}
              <div className='flex gap-2'>
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className='w-2.5 h-2.5 rounded-full transition-all duration-300 bg-slate-800 cursor-pointer hover:bg-slate-700 font-sans p-0 border-0'
                    style={{
                      backgroundColor: i === step ? '#22d3ee' : undefined,
                      width: i === step ? '1.5rem' : undefined,
                      boxShadow: i === step ? '0 0 8px rgba(34,211,238,0.8)' : undefined,
                    }}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className='w-full flex gap-3'>
                {step > 0 && (
                  <Button
                    variant='secondary'
                    onClick={handleBack}
                    className='flex-1 py-3 border border-slate-700/50 hover:bg-slate-800/40 text-slate-300 font-bold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 pointer-events-auto cursor-pointer'
                  >
                    <ArrowLeft className='w-4 h-4 text-slate-400' /> Back
                  </Button>
                )}

                <Button
                  variant='primary'
                  onClick={handleNext}
                  className={`${step > 0 ? 'flex-1' : 'w-full'} py-3 relative group overflow-hidden pointer-events-auto cursor-pointer`}
                >
                  <span className='relative flex items-center justify-center gap-2 font-bold tracking-widest uppercase text-slate-950'>
                    Next <ArrowRight className='w-4 h-4 text-slate-950' />
                  </span>
                </Button>
              </div>

              {/* Skip to Login option */}
              <button
                onClick={handleSkip}
                className='text-slate-500 hover:text-slate-300 text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer'
              >
                Skip to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
