'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Settings, UserRoundCheck, HandCoins, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import AuthenticatedAvatar from '@/components/AuthenticatedAvatar';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navItems = [
      { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
      { href: '/admin/users', icon: Users, label: 'Users' },
      { href: '/admin/guides', icon: UserRoundCheck, label: 'Guides' },
      { href: '/admin/admin-fee', icon: FileText, label: 'Fee' },
      { href: '/admin/withdrawals', icon: HandCoins, label: 'withdrawals' },
    ];

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
      <div className="bg-gray-800 text-white w-64 min-h-screen p-4 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        </div>
        <nav className="flex-grow">
          <ul>
            {navItems.map((item) => (
              <li key={item.href} className="mb-4">
                <Link 
                  href={item.href} 
                  className={`flex items-center hover:text-blue-400 transition-colors ${
                    pathname === item.href ? 'text-blue-400' : ''
                  }`}
                >
                  <item.icon className="mr-2" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut className="mr-2" />
          Logout
        </button>
      </div>
    );
}