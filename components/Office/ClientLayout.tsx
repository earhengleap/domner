'use client';

import React from 'react';
import Sidebar from './Sidebar';

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
};

export default ClientLayout;