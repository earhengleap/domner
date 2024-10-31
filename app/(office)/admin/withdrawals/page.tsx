import { Metadata } from 'next';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import { authOptions } from "@/lib/authOptions";
import Withdrawals from '@/components/Office/Withdrawal';

export const metadata: Metadata = {
  title: 'Admin Withdrawals Dashboard',
  description: 'Manage and process guide withdrawal requests',
};

export default async function AdminWithdrawalsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Withdrawal Management</h1>
      <Withdrawals />
    </div>
  );
}