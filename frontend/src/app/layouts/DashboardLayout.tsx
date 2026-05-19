import { ReactNode } from 'react';
import type { Tab } from '../../shared/types/navigation';
import { cn } from '../../shared/utils/cn';

interface DashboardLayoutProps {
  activeTab: Tab;
  leftSidebar: ReactNode;
  mainContent: ReactNode;
  rightSidebar: ReactNode; // We will use this in the center column
}

export function DashboardLayout({
  activeTab,
  leftSidebar,
  mainContent,
  rightSidebar,
}: DashboardLayoutProps) {
  return (
    <div className='w-full h-full flex flex-col md:grid md:grid-cols-12 gap-0 md:gap-6 pb-20 md:pb-0 overflow-hidden'>
      {/* Left Sidebar: Quest List (4 cols on lg, 5 on md) */}
      <aside
        className={cn(
          'h-full overflow-y-auto overflow-x-hidden custom-scrollbar',
          'md:col-span-5 lg:col-span-4',
          activeTab === 'quests' ? 'flex flex-col' : 'hidden md:flex flex-col',
        )}
      >
        {leftSidebar}
      </aside>

      {/* Right Content Area: Dashboard & Status (8 cols on lg, 7 on md) */}
      <main
        className={cn(
          'h-full overflow-y-auto overflow-x-hidden custom-scrollbar',
          'md:col-span-7 lg:col-span-8',
          activeTab === 'dashboard' || activeTab === 'character'
            ? 'flex flex-col'
            : 'hidden md:flex flex-col',
          'gap-6',
        )}
      >
        {/* On Desktop, show mainContent and rightSidebar stacked or side-by-side depending on breakpoint.
            Let's stack them gracefully, or make a subgrid. */}
        <div className='flex flex-col lg:grid lg:grid-cols-8 gap-6 min-h-full'>
          <div
            className={cn(
              'flex flex-col gap-6 lg:col-span-5 flex-1 min-h-0',
              activeTab === 'dashboard' ? 'flex' : 'hidden lg:flex',
            )}
          >
            {mainContent}
          </div>
          <div
            className={cn(
              'flex flex-col gap-6 lg:col-span-3 flex-1 min-h-0',
              activeTab === 'character' ? 'flex' : 'hidden lg:flex',
            )}
          >
            {rightSidebar}
          </div>
        </div>
      </main>
    </div>
  );
}
