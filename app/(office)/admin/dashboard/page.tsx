// app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  pendingApplications: number;
  totalUsers: number;
  totalGuides: number;
  totalBookings: number;
  totalRevenue: number;
}

interface RecentActivity {
  id: string;
  type: "application" | "booking" | "withdrawal" | "new_guide";
  description: string;
  date: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    } else if (session.user?.role !== "ADMIN") {
      router.push("/error");
    } else {
      fetchDashboardData();
    }
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        fetch("/api/admin/dashboardStats"),
        fetch("/api/admin/recentActivities"),
      ]);

      if (statsRes.ok && activitiesRes.ok) {
        const statsData = await statsRes.json();
        const activitiesData = await activitiesRes.json();
        setStats(statsData);
        setRecentActivities(activitiesData);
      } else {
        console.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  if (status === "loading" || !stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"/>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  const statCards = [
    {
      name: "Pending Applications",
      value: stats.pendingApplications,
      icon: ClipboardDocumentCheckIcon,
      link: "/admin/guide-applications",
    },
    {
      name: "Total Users",
      value: stats.totalUsers,
      icon: UserIcon,
      link: "/admin/users",
    },
    {
      name: "Total Guides",
      value: stats.totalGuides,
      icon: MapPinIcon,
      link: "/admin/guides",
    },
    {
      name: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarIcon,
      link: "/admin/bookings",
    },
    {
      name: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      link: "/admin/finance",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-blue-500" />;
      case "booking":
        return <CalendarIcon className="h-5 w-5 text-green-500" />;
      case "withdrawal":
        return <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />;
      case "new_guide":
        return <MapPinIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {statCards.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon
                    className="h-6 w-6 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {item.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href={item.link}
                className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
              >
                View all
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activities
          </h3>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <li key={activity.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getActivityIcon(activity.type)}
                    <p className="ml-3 text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/admin/guide-applications"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Review Applications
              </Link>
              <Link
                href="/admin/create-guide"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Create Guide
              </Link>
              <Link
                href="/admin/send-notification"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
              >
                Send Notification
              </Link>
              <Link
                href="/admin/generate-report"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Generate Report
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              System Status
            </h3>
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Server Uptime
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  99.9%
                </dd>
              </div>
              <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Users
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  1,234
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
