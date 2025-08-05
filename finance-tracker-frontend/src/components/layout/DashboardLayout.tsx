/**
 * Dashboard Layout Component
 * 
 * This component provides the layout structure for dashboard pages,
 * including the global navbar and main content area.
 * It replaces the sidebar-based AppLayout for a more modern approach.
 */

import React from 'react';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="dashboard-layout">
      {/* Global Navigation Bar */}
      <Navbar />
      
      {/* Main Content Area */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;