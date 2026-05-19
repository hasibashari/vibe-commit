import React from 'react';

interface BackgroundLayerProps {
  imageUrl?: string;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ imageUrl }) => {
  // Use a placeholder or provided image
  const bgImg =
    imageUrl ||
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className='absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-xl'>
      <div
        className='absolute inset-0 bg-cover bg-center opacity-75 blur-[1px]'
        style={{ backgroundImage: `url(${bgImg})` }}
      />
      {/* Overlay to ensure UI readability */}
      <div className='absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/60 to-slate-900/40' />

      {/* Optional decorative atmosphere elements */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden opacity-20'>
        <div className='absolute w-[300px] h-[300px] bg-accent-500/20 top-[-100px] left-[-100px] rounded-full blur-3xl mix-blend-screen' />
        <div className='absolute w-[300px] h-[300px] bg-emerald-500/10 bottom-1/4 right-[-100px] rounded-full blur-3xl mix-blend-screen' />
      </div>
    </div>
  );
};
