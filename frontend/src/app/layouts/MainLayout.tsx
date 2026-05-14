import React, { ReactNode } from 'react';

interface MainLayoutProps {
  environment?: ReactNode;
  header: ReactNode;
  bottomNav: ReactNode;
  statusBar: ReactNode;
  children: ReactNode;
  modals?: ReactNode;
}

export function MainLayout({ 
  environment, 
  header, 
  bottomNav, 
  statusBar, 
  children, 
  modals 
}: MainLayoutProps) {
  return (
    <>
      {environment}
      <div className="h-[100dvh] overflow-hidden text-slate-300 font-sans selection:bg-cyan-500 selection:text-black relative z-10 w-full flex flex-col">
        {header}
        
        <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-[1600px] mx-auto flex-1 min-h-0">
          {children}
        </div>

        {bottomNav}
        {statusBar}
        {modals}
      </div>
    </>
  );
}
