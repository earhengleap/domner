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
    <AdminFeeDashboard />
  );
}
