import React, { ReactNode, useState } from 'react';
import { Navigation } from '../organisms/Navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-mute">
      <Navigation isOpen={isNavOpen} onToggle={() => setIsNavOpen(!isNavOpen)} />

      <div className="md:ml-64">
        <main className="p-4 md:p-8 relative">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-soft/40 to-transparent"
            aria-hidden="true"
          />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
};
