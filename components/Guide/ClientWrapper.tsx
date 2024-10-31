'use client'

import React from 'react';
import { UserProvider } from '@/context/UserContext';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}