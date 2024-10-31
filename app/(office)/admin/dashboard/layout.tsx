import React from 'react';
import Sidebar from '@/components/Office/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <main className="flex-1 p-10">{children}</main>
  </div>
);

export default Layout;