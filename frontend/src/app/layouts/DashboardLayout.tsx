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
    <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-4 md:gap-6 h-full pb-24 md:pb-0">
      
      {/* Left Sidebar: Quest List */}
      <aside className={`col-span-1 md:col-span-3 lg:col-span-3 flex-col gap-4 md:gap-6 h-full min-h-0 overflow-y-auto custom-scrollbar ${
        activeTab === 'quests' ? 'flex' : 'hidden md:flex'
      }`}>
        {leftSidebar}
      </aside>

      {/* Center: Dashboard */}
      <main className={`col-span-1 md:col-span-5 lg:col-span-6 flex-col gap-4 md:gap-6 h-full min-h-0 overflow-y-auto custom-scrollbar ${
        activeTab === 'dashboard' ? 'flex' : 'hidden lg:flex'
      }`}>
        {mainContent}
      </main>

      {/* Right Sidebar: Status/Character */}
      <aside className={`col-span-1 md:col-span-8 lg:col-span-3 flex-col gap-4 md:gap-6 h-full min-h-0 overflow-y-auto custom-scrollbar ${
        activeTab === 'character' ? 'flex' : 'hidden lg:flex'
      }`}>
        {rightSidebar}
      </aside>

    </div>
  );
}
