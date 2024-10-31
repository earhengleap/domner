'use client'
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GuideFincanceDashboard from '@/components/Guide/Guide-Finance-Dashboard';

export default function FinanceDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen"><div className="loader"/></div>;
  }

  if (!session || session.user.role !== 'GUIDE') {
    return <div className="p-36 max-w-6xl mx-auto">You do not have permission to view this page.</div>;
  }

  return (
    <div className="p-36 max-w-6xl mx-auto">
      <h1 className="text-2xl text-green-800 font-normal mb-6">Finance Dashboard</h1>
      <GuideFincanceDashboard />
    </div>
  );
}