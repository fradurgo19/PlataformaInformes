import React, { ReactNode, useState } from 'react';
import { Navigation } from '../organisms/Navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation isOpen={isNavOpen} onToggle={() => setIsNavOpen(!isNavOpen)} />
      
      <div className="md:ml-64">
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};