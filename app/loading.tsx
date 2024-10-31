// app/loading.tsx
import React from 'react';
import { delay } from '@/lib/delay';

export default async function Loading() {
  await delay(12000);
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="loader"></div>
    </div>
  );
}