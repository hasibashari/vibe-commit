import React, { ReactNode } from 'react';
import type { Tab } from '../App';

interface DashboardLayoutProps {
  activeTab: Tab;
  leftSidebar: ReactNode;
  mainContent: ReactNode;
  rightSidebar: ReactNode;
}

export function DashboardLayout({ 
  activeTab, 
  leftSidebar, 
  mainContent, 
  rightSidebar
}: DashboardLayoutProps) {
  return (
    <div className="relative md:grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-0 md:gap-6 lg:gap-6 h-full pb-24 lg:pb-0 w-full">
      
      {/* Left Sidebar: Quest List */}
      <aside className={`absolute md:static inset-0 w-full md:w-auto md:col-start-1 md:col-span-3 lg:col-span-3 flex-col gap-4 md:gap-6 h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar transition-all duration-300 ease-in-out ${
        activeTab === 'quests' ? 'opacity-100 z-10 pointer-events-auto transform-none' : 'opacity-0 -z-10 -translate-x-4 pointer-events-none md:pointer-events-auto md:opacity-100 md:translate-x-0 md:z-auto'
      } flex`}>
        {leftSidebar}
      </aside>

      {/* Center: Dashboard */}
      <main className={`absolute md:static inset-0 w-full md:w-auto md:col-start-4 md:col-span-5 lg:col-start-4 lg:col-span-6 flex-col gap-4 md:gap-6 h-full min-h-0 overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${
        activeTab === 'dashboard' ? 'opacity-100 z-10 pointer-events-auto transform-none' : 'opacity-0 -z-10 translate-x-4 pointer-events-none lg:pointer-events-auto lg:opacity-100 lg:translate-x-0 lg:z-auto'
      } flex`}>
        {mainContent}
      </main>

      {/* Right Sidebar: Status/Character */}
      <aside className={`absolute md:static inset-0 w-full md:w-auto md:col-start-4 md:col-span-5 lg:col-start-10 lg:col-span-3 flex-col gap-4 md:gap-6 h-full min-h-0 overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${
        activeTab === 'character' ? 'opacity-100 z-10 pointer-events-auto transform-none' : 'opacity-0 -z-10 translate-x-4 pointer-events-none lg:pointer-events-auto lg:opacity-100 lg:translate-x-0 lg:z-auto'
      } flex`}>
        {rightSidebar}
      </aside>

    </div>
  );
}
