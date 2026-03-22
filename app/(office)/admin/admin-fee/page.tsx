import React from 'react';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import { authOptions } from "@/lib/authOptions";
import AdminFeeDashboard from '@/components/Office/FeeManagement';
import { hasAdminAccess } from "@/lib/access";

export const metadata = {
  title: 'Admin Fee Dashboard',
  description: 'Manage and view fee statistics for the application',
};

export default async function AdminFeeDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !hasAdminAccess(session.user)) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Fee Dashboard</h1>
      <AdminFeeDashboard />
    </div>
  );
}
