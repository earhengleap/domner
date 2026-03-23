"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { hasAdminAccess } from "@/lib/access";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapPinned, RefreshCw, TrendingUp } from "lucide-react";

interface Guide {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
}

interface GuideRegistrationData {
  date: string;
  count: number;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GuidesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [registrationData, setRegistrationData] = useState<GuideRegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !hasAdminAccess(session.user)) {
      router.push("/login");
      return;
    }
    void fetchGuidesData();
  }, [session, status, router]);

  const fetchGuidesData = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetch("/api/admin/guides", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setGuides(data.users || []);
        setRegistrationData(data.registrationData || []);
      } else {
        console.error("Failed to fetch guides data");
      }
    } catch (error) {
      console.error("Error fetching guides data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const totalNewInSeries = useMemo(
    () => registrationData.reduce((sum, item) => sum + item.count, 0),
    [registrationData]
  );

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Guides</h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor guide onboarding and recent registrations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchGuidesData(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Guides</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{guides.length.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Recent Registrations</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{totalNewInSeries.toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Guide Registration Trend</h2>
          <TrendingUp className="h-4 w-4 text-slate-400" />
        </div>

        <div className="h-[280px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={registrationData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(value: string) => value?.slice(5)}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="hidden sm:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-200 sm:px-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Latest Registered Guides</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guides.map((guide) => (
                <tr key={guide.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-900">{guide.name || "Unnamed Guide"}</td>
                  <td className="px-4 py-3 text-slate-600">{guide.email || "No email"}</td>
                  <td className="px-4 py-3 text-slate-600" suppressHydrationWarning>
                    {formatDate(guide.createdAt)}
                  </td>
                </tr>
              ))}
              {guides.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    No guides found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sm:hidden">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Mobile Cards</h3>
        <div className="space-y-2">
          {guides.slice(0, 12).map((guide) => (
            <article key={`mobile-${guide.id}`} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-semibold text-slate-900">{guide.name || "Unnamed Guide"}</p>
              </div>
              <p className="text-xs text-slate-600 mt-1 break-all">{guide.email || "No email"}</p>
              <p className="text-xs text-slate-500 mt-2" suppressHydrationWarning>
                Joined {formatDate(guide.createdAt)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
