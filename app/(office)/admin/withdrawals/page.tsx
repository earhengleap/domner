import { Metadata } from 'next';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import { authOptions } from "@/lib/authOptions";
import Withdrawals from '@/components/Office/Withdrawal';
import { hasAdminAccess } from "@/lib/access";

export const metadata: Metadata = {
  title: 'Admin Withdrawals Dashboard',
  description: 'Manage and process guide withdrawal requests',
};

export default async function AdminWithdrawalsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !hasAdminAccess(session.user)) {
    redirect('/login');
  }

  return (
    <Withdrawals />
  );
}
