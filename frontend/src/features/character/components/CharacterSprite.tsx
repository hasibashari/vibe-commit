import React from 'react';
import { motion } from 'motion/react';

interface CharacterSpriteProps {
  imageUrl?: string;
  hp?: number;
  mana?: number;
  tapCount?: number;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  imageUrl,
  hp = 100,
  mana = 100,
  tapCount = 0,
}) => {
  // Determine character state
  const isDizzy = tapCount > 2;
  const isTired = hp < 50;
  const isSleeping = mana < 30;
  const isHappy = hp >= 80 && mana >= 80 && !isDizzy;

  // Choose the float animation speed depending on state
  const floatClass = isSleeping ? 'float-slow' : isDizzy ? 'float-fast' : 'float-bot';

  return (
    <motion.div
      animate={imageUrl ? { y: [0, -4, 0] } : {}}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: 'easeInOut',
      }}
      className='relative w-48 h-48 sm:w-40 sm:h-40 md:w-40 md:h-40 lg:w-40 lg:h-40 drop-shadow-2xl z-10 flex items-center justify-center select-none'
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt='Custom Character'
          className='max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(var(--theme-400-rgb),0.2)]'
          referrerPolicy='no-referrer'
        />
      ) : (
        <svg
          viewBox='0 0 64 64'
          className='w-full h-full overflow-visible'
          shapeRendering='geometricPrecision'
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Glossy Gradient for Head/Body Outer Shell */}
            <linearGradient id='shellGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor='#1e293b' />
              <stop offset='100%' stopColor='#0f172a' />
            </linearGradient>

            {/* Glowing Gradient for Ears and Core */}
            <linearGradient id='themeGlow' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stopColor='var(--theme-300)' />
              <stop offset='100%' stopColor='var(--theme-600)' />
            </linearGradient>

            {/* Screen Depth Shadow */}
            <radialGradient id='screenGrad' cx='50%' cy='50%' r='50%'>
              <stop offset='0%' stopColor='#0b0f19' />
              <stop offset='100%' stopColor='#020617' />
            </radialGradient>
          </defs>

          <style>{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-7px); }
              100% { transform: translateY(0px); }
            }
            @keyframes float-sleep {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-4px); }
              100% { transform: translateY(0px); }
            }
            @keyframes float-dizzy {
              0% { transform: translateY(0px) rotate(-1deg); }
              25% { transform: translateY(-3px) rotate(1.5deg); }
              50% { transform: translateY(0px) rotate(-2deg); }
              75% { transform: translateY(-4px) rotate(1deg); }
              100% { transform: translateY(0px) rotate(-1deg); }
            }
            @keyframes shadow-scale {
              0% { transform: scale(1); opacity: 0.25; }
              50% { transform: scale(0.72); opacity: 0.12; }
              100% { transform: scale(1); opacity: 0.25; }
            }
            @keyframes shadow-scale-sleep {
              0% { transform: scale(1); opacity: 0.25; }
              50% { transform: scale(0.85); opacity: 0.18; }
              100% { transform: scale(1); opacity: 0.25; }
            }
            @keyframes fire-pulse {
              0% { transform: scaleY(0.8) scaleX(0.85); opacity: 0.7; }
              100% { transform: scaleY(1.2) scaleX(1.15); opacity: 1; }
            }
            @keyframes core-pulse {
              0% { opacity: 0.65; }
              100% { opacity: 1; filter: drop-shadow(0 0 6px var(--theme-400)); }
            }
            @keyframes eye-blink {
              0%, 90%, 100% { transform: scaleY(1); }
              95% { transform: scaleY(0.05); }
            }
            @keyframes antenna-pulse {
              0% { transform: scale(0.6); opacity: 0.15; }
              50% { opacity: 0.8; }
              100% { transform: scale(1.5); opacity: 0; }
            }
            .float-bot {
              animation: float 3.5s ease-in-out infinite;
              transform-origin: center bottom;
            }
            .float-slow {
              animation: float-sleep 6s ease-in-out infinite;
              transform-origin: center bottom;
            }
            .float-fast {
              animation: float-dizzy 1.2s ease-in-out infinite;
              transform-origin: center bottom;
            }
            .shadow-bot {
              animation: shadow-scale 3.5s ease-in-out infinite;
              transform-origin: 32px 58px;
            }
            .shadow-slow {
              animation: shadow-scale-sleep 6s ease-in-out infinite;
              transform-origin: 32px 58px;
            }
            .fire-bot {
              animation: fire-pulse 0.15s ease-in-out infinite alternate;
              transform-origin: 32px 46px;
            }
            .core-bot {
              animation: core-pulse 1.2s ease-in-out infinite alternate;
            }
            .eye-blink-left {
              animation: eye-blink 5s infinite;
              transform-origin: 23.5px 21px;
            }
            .eye-blink-right {
              animation: eye-blink 5s infinite;
              transform-origin: 40.5px 21px;
            }
            .antenna-glow {
              animation: antenna-pulse 2s ease-in-out infinite;
              transform-origin: 32px 3px;
            }
          `}</style>

          {/* Ambient Shadow beneath the floating robot */}
          <ellipse
            cx='32'
            cy='58'
            rx='15'
            ry='3.5'
            fill='#000000'
            className={isSleeping ? 'shadow-slow' : 'shadow-bot'}
          />

          {/* Glowing Ground Indicator Rings */}
          <ellipse
            cx='32'
            cy='58'
            rx='18'
            ry='4.2'
            fill='none'
            stroke='var(--theme-500)'
            strokeWidth='0.75'
            opacity={isSleeping ? '0.1' : isDizzy ? '0.4' : '0.2'}
            strokeDasharray='4 2'
          />

          {/* Main Floating Robot Group */}
          <g className={floatClass}>
            {/* Pulsating Antenna Glow Beacon (Only happy/normal) */}
            {!isTired && !isSleeping && !isDizzy && (
              <circle
                cx='32'
                cy='3'
                r='3.5'
                fill='var(--theme-400)'
                className='antenna-glow'
              />
            )}

            {/* Antenna */}
            <line
              x1='32'
              y1='8'
              x2='32'
              y2='3'
              stroke='#475569'
              strokeWidth='2'
              strokeLinecap='round'
            />
            <circle
              cx='32'
              cy='3'
              r='2'
              fill='var(--theme-400)'
              className='core-bot'
            />

            {/* Left Ear Fin */}
            <path
              d='M14 18 C11 18 10 20 10 24 C10 28 11 30 14 30 Z'
              fill={isTired ? '#f43f5e' : 'url(#themeGlow)'}
              opacity={isSleeping ? '0.5' : '1'}
              stroke='#1e293b'
              strokeWidth='1.5'
            />

            {/* Right Ear Fin */}
            <path
              d='M50 18 C53 18 54 20 54 24 C54 28 53 30 50 30 Z'
              fill={isTired ? '#f43f5e' : 'url(#themeGlow)'}
              opacity={isSleeping ? '0.5' : '1'}
              stroke='#1e293b'
              strokeWidth='1.5'
            />

            {/* Thruster Jet Fire Exhaust */}
            <path
              d='M28 45 L32 54 L36 45 Z'
              fill='var(--theme-500)'
              opacity={isSleeping ? '0.3' : isDizzy ? '0.9' : '0.7'}
              className='fire-bot'
            />
            <path
              d='M30 45 L32 50 L34 45 Z'
              fill='var(--theme-300)'
              opacity={isSleeping ? '0.4' : '0.8'}
              className='fire-bot'
            />

            {/* Thruster Metal Port */}
            <path
              d='M27 43 L37 43 L35 46 L29 46 Z'
              fill='#334155'
              stroke='#1e293b'
              strokeWidth='1'
            />

            {/* Arm Shell Connectors */}
            <path
              d='M15 32 Q13 32 12 35'
              stroke='#475569'
              strokeWidth='2'
              strokeLinecap='round'
              fill='none'
            />
            <path
              d='M49 32 Q51 32 52 35'
              stroke='#475569'
              strokeWidth='2'
              strokeLinecap='round'
              fill='none'
            />

            {/* Floating Left Sphere Hand */}
            <circle
              cx='10'
              cy='37'
              r='3'
              fill='url(#shellGrad)'
              stroke={isTired ? '#f43f5e' : 'var(--theme-500)'}
              strokeWidth='1.5'
            />
            {/* Floating Right Sphere Hand */}
            <circle
              cx='54'
              cy='37'
              r='3'
              fill='url(#shellGrad)'
              stroke={isTired ? '#f43f5e' : 'var(--theme-500)'}
              strokeWidth='1.5'
            />

            {/* Main Torso / Body Chassis */}
            <path
              d='M20 32 L44 32 Q46 32 45 35 L40 44 Q39 45 37 45 L27 45 Q25 45 24 44 L19 35 Q18 32 20 32 Z'
              fill='url(#shellGrad)'
              stroke='#334155'
              strokeWidth='2'
            />

            {/* Power Core Light (Pulses with theme color) */}
            <circle
              cx='32'
              cy='38'
              r='3.5'
              fill='var(--theme-400)'
              className='core-bot'
            />
            <circle
              cx='32'
              cy='38'
              r='1.5'
              fill='#ffffff'
            />

            {/* Decorative Cybernetic Collar lines */}
            <line x1='24' y1='34' x2='40' y2='34' stroke='#1e293b' strokeWidth='1.5' />

            {/* Head Outer Shell */}
            <rect
              x='14'
              y='8'
              width='36'
              height='24'
              rx='10'
              fill='url(#shellGrad)'
              stroke='#334155'
              strokeWidth='2.5'
            />

            {/* Glass Face Screen */}
            <rect
              x='17'
              y='11'
              width='30'
              height='18'
              rx='7'
              fill='url(#screenGrad)'
              stroke='#1e293b'
              strokeWidth='1.5'
            />

            {/* Display Glare Overlay (Premium glass feeling) */}
            <path
              d='M18 13 L42 13 L18 27 Z'
              fill='#ffffff'
              opacity='0.04'
              pointerEvents='none'
            />

            {/* LED Face Display Rendering */}
            {isDizzy ? (
              // DIZZY STATE (X_X)
              <g stroke='var(--theme-400)' strokeWidth='2' strokeLinecap='round'>
                {/* Left X */}
                <line x1='21.5' y1='18' x2='25.5' y2='22' />
                <line x1='25.5' y1='18' x2='21.5' y2='22' />
                {/* Right X */}
                <line x1='38.5' y1='18' x2='42.5' y2='22' />
                <line x1='42.5' y1='18' x2='38.5' y2='22' />
                {/* Dizzy Squiggly Mouth */}
                <path d='M29 25 L31 24 L33 26 L35 25' fill='none' strokeWidth='1.5' />
              </g>
            ) : isTired ? (
              // LOW HP / TIRED STATE (Sayu eyes with warnings)
              <g>
                {/* Warning Light Pulse behind face */}
                <circle cx='32' cy='20' r='12' fill='#ef4444' opacity='0.15' className='core-bot' />
                {/* Red warning indicator on forehead */}
                <polygon points='32,12 34,15 30,15' fill='#ef4444' className='core-bot' />
                {/* Drooping/tired eyes */}
                <rect x='20.5' y='19.5' width='6' height='2' rx='1' fill='var(--theme-400)' opacity='0.8' />
                <rect x='37.5' y='19.5' width='6' height='2' rx='1' fill='var(--theme-400)' opacity='0.8' />
                {/* Worried mouth */}
                <path d='M29 25 Q32 23 35 25' fill='none' stroke='var(--theme-400)' strokeWidth='1.5' strokeLinecap='round' opacity='0.8' />
              </g>
            ) : isSleeping ? (
              // LOW MANA / SLEEPING STATE (u_u)
              <g fill='none' stroke='var(--theme-400)' strokeWidth='2' strokeLinecap='round'>
                {/* Closed sleepy eyes (under arcs) */}
                <path d='M20.5 19 Q23.5 22 26.5 19' opacity='0.7' />
                <path d='M37.5 19 Q40.5 22 43.5 19' opacity='0.7' />
                {/* Tiny quiet mouth */}
                <circle cx='32' cy='24' r='1' fill='var(--theme-400)' stroke='none' opacity='0.6' />
                {/* Sleep floating Z's */}
                <g fill='var(--theme-400)' fontSize='5' fontFamily='monospace' fontWeight='bold' opacity='0.6' style={{ animation: 'float 4s infinite' }}>
                  <text x='44' y='12'>z</text>
                  <text x='46' y='9' fontSize='3.5'>z</text>
                </g>
              </g>
            ) : isHappy ? (
              // HAPPY / HIGHER STATS STATE (^v^)
              <g fill='none' stroke='var(--theme-400)' strokeWidth='2' strokeLinecap='round'>
                {/* Smiling Eyes */}
                <path d='M20.5 21.5 Q23.5 18.5 26.5 21.5' className='core-bot' />
                <path d='M37.5 21.5 Q40.5 18.5 43.5 21.5' className='core-bot' />
                {/* Happy open mouth */}
                <path d='M30 24 Q32 26 34 24' strokeWidth='1.5' />
                {/* Sparkles on the screen */}
                <polygon points='19,13 20,15 22,15 20,16 20,18 19,16 17,16 19,15' fill='var(--theme-300)' stroke='none' className='core-bot' />
                <polygon points='45,13 46,15 48,15 46,16 46,18 45,16 43,16 45,15' fill='var(--theme-300)' stroke='none' className='core-bot' />
              </g>
            ) : (
              // NORMAL STATE
              <g fill='var(--theme-400)'>
                {/* Large beautiful glowing pill eyes with blinking animation */}
                <rect x='21' y='17' width='5' height='8' rx='2.5' className='eye-blink-left' />
                <rect x='38' y='17' width='5' height='8' rx='2.5' className='eye-blink-right' />
                {/* Tiny cyber cheek dots */}
                <circle cx='19' cy='23' r='0.8' fill='var(--theme-500)' opacity='0.5' />
                <circle cx='45' cy='23' r='0.8' fill='var(--theme-500)' opacity='0.5' />
                {/* Content friendly mouth */}
                <path d='M30 23.5 Q32 25 34 23.5' fill='none' stroke='var(--theme-400)' strokeWidth='1.5' strokeLinecap='round' />
              </g>
            )}
          </g>
        </svg>
      )}
    </motion.div>
  );
};

