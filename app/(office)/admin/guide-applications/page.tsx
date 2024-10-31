// app/admin/applications/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  fullName: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function GuideApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login');
    } else {
      fetchApplications();
    }
  }, [session, status, router]);

  const fetchApplications = async () => {
    const res = await fetch('/api/admin/applications');
    if (res.ok) {
      const data = await res.json();
      setApplications(data);
    }
  };

  if (status === 'loading') {
    return <div className='loader'/>;
  }

  const filteredApplications = applications.filter(app => app.status === activeTab);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6">Check Guide</h1>
        
        {/* Tabs */}
        <div className="bg-white rounded-t-lg overflow-hidden mb-1">
          <nav className="flex" aria-label="Tabs">
            {['PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'PENDING' | 'APPROVED' | 'REJECTED')}
                className={`${
                  activeTab === tab
                    ? 'bg-white text-gray-800 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                } flex-1 py-4 px-4 text-center text-sm font-medium`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </nav>
        </div>

        {/* Application List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-b-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredApplications.map((application) => (
              <li key={application.id}>
                <Link href={`/admin/applications/${application.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">{application.fullName}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {application.email}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Applied on{' '}
                          <time dateTime={application.createdAt}>
                            {new Date(application.createdAt).toLocaleDateString()}
                          </time>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}