import React from 'react';

interface BackgroundLayerProps {
  imageUrl?: string;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ imageUrl }) => {
  // Use a placeholder or provided image
  const bgImg =
    imageUrl ||
    '/images/mountain_anime.jpg';

  return (
    <div className='absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-xl'>
      <div
        className='absolute inset-0 bg-cover bg-center opacity-80'
        style={{ backgroundImage: `url(${bgImg})` }}
      />
      {/* Overlay to ensure UI readability */}
      <div className='absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/60 to-slate-900/40' />

      {/* Optional decorative atmosphere elements */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden opacity-30'>
        <div className='absolute w-[300px] h-[300px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-accent-500/20 to-transparent top-[-100px] left-[-100px] rounded-full mix-blend-screen' />
        <div className='absolute w-[300px] h-[300px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-emerald-500/15 to-transparent bottom-1/4 right-[-100px] rounded-full mix-blend-screen' />
      </div>
    </div>
  );
};
