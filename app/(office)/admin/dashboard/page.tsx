// app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { hasAdminAccess } from "@/lib/access";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  DollarSign,
  MapPinned,
  Minus,
  Plus,
  RefreshCw,
  User,
  UserRoundPlus,
  Users,
} from "lucide-react";

interface DashboardStats {
  pendingApplications: number;
  totalUsers: number;
  totalGuides: number;
  totalBookings: number;
  totalRevenue: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  date: string;
}

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
}

interface RegistrationDataPoint {
  date: string;
  count: number;
}

interface MemberApiResponse {
  users: Member[];
  registrationData: RegistrationDataPoint[];
}

interface DailySeriesPoint {
  key: string;
  label: string;
  count: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

function buildDailySeries(
  rawData: RegistrationDataPoint[],
  numberOfDays = 14
): DailySeriesPoint[] {
  const bucket = new Map<string, number>();

  for (const item of rawData) {
    bucket.set(item.date, (bucket.get(item.date) || 0) + item.count);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const series: DailySeriesPoint[] = [];
  for (let i = numberOfDays - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * DAY_MS);
    const key = date.toISOString().split("T")[0];
    series.push({
      key,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: bucket.get(key) || 0,
    });
  }

  return series;
}

function sumSeries(series: DailySeriesPoint[]) {
  return series.reduce((sum, point) => sum + point.count, 0);
}

function getActivityMeta(type: string) {
  switch (type) {
    case "application":
      return {
        icon: <ClipboardList className="h-4 w-4" />,
        badge: "Application",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "booking":
      return {
        icon: <CalendarDays className="h-4 w-4" />,
        badge: "Booking",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "withdrawal":
      return {
        icon: <DollarSign className="h-4 w-4" />,
        badge: "Withdrawal",
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "new_guide":
    case "new_guide_post":
      return {
        icon: <MapPinned className="h-4 w-4" />,
        badge: "Guide",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "new_user":
      return {
        icon: <UserRoundPlus className="h-4 w-4" />,
        badge: "User",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };
    default:
      return {
        icon: <Activity className="h-4 w-4" />,
        badge: "Activity",
        className: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
}

function TrendMiniChart({
  series,
  tone = "user",
}: {
  series: DailySeriesPoint[];
  tone?: "user" | "guide";
}) {
  const maxCount = Math.max(...series.map((point) => point.count), 1);
  const barColor =
    tone === "guide" ? "bg-emerald-400/90" : "bg-[#A18167]/90";

  return (
    <div className="space-y-2">
      <div className="h-20 flex items-end gap-1">
        {series.map((point) => {
          const height = Math.max((point.count / maxCount) * 100, point.count > 0 ? 12 : 6);
          return (
            <div
              key={point.key}
              className="flex-1 h-full flex items-end"
              title={`${point.label}: ${point.count}`}
            >
              <div
                className={`w-full rounded-sm ${barColor}`}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>{series[0]?.label}</span>
        <span>{series[series.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [usersData, setUsersData] = useState<MemberApiResponse | null>(null);
  const [guidesData, setGuidesData] = useState<MemberApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [feeRatePercent, setFeeRatePercent] = useState<number | null>(null);
  const [feeInput, setFeeInput] = useState("");
  const [feeMessage, setFeeMessage] = useState<string | null>(null);
  const [isSavingFee, setIsSavingFee] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (!hasAdminAccess(session.user)) {
      router.push("/error");
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async (backgroundRefresh = false) => {
    if (backgroundRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setErrorMessage(null);

      const [statsRes, activitiesRes, usersRes, guidesRes] = await Promise.all([
        fetch("/api/admin/dashboardStats", { cache: "no-store" }),
        fetch("/api/admin/recentActivities", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/guides", { cache: "no-store" }),
      ]);

      if (!statsRes.ok || !activitiesRes.ok || !usersRes.ok || !guidesRes.ok) {
        throw new Error("Failed to load one or more dashboard data sources.");
      }

      const [statsPayload, activitiesPayload, usersPayload, guidesPayload] =
        await Promise.all([
          statsRes.json(),
          activitiesRes.json(),
          usersRes.json(),
          guidesRes.json(),
        ]);

      setStats(statsPayload);
      setRecentActivities(Array.isArray(activitiesPayload) ? activitiesPayload : []);
      setUsersData(usersPayload);
      setGuidesData(guidesPayload);
      setLastUpdatedAt(new Date());
      await fetchFeeConfig();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setErrorMessage("Could not load dashboard data. Please refresh.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchFeeConfig = async () => {
    try {
      const response = await fetch("/api/admin/fee-config", { cache: "no-store" });
      if (!response.ok) return;

      const data = await response.json();
      const nextPercent = Number((Number(data?.feeRate || 0.1) * 100).toFixed(2));
      setFeeRatePercent(nextPercent);
      setFeeInput(String(nextPercent));
    } catch (error) {
      console.error("Failed to fetch fee configuration:", error);
    }
  };

  const adjustFeeInput = (delta: number) => {
    const current = Number.parseFloat(feeInput);
    const base = Number.isFinite(current)
      ? current
      : feeRatePercent ?? 10;
    const next = Math.max(0, Math.min(100, Number((base + delta).toFixed(2))));
    setFeeInput(String(next));
    setFeeMessage(null);
  };

  const handleSaveFee = async () => {
    const numericFee = Number.parseFloat(feeInput);

    if (!Number.isFinite(numericFee) || numericFee < 0 || numericFee > 100) {
      setFeeMessage("Enter a valid fee between 0 and 100.");
      return;
    }

    try {
      setIsSavingFee(true);
      setFeeMessage(null);

      const response = await fetch("/api/admin/fee-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeRate: numericFee / 100 }),
      });

      if (!response.ok) {
        throw new Error("Failed to update fee.");
      }

      setFeeRatePercent(numericFee);
      setFeeInput(String(Number(numericFee.toFixed(2))));
      setFeeMessage("Royalty fee updated successfully.");
    } catch (error) {
      console.error("Error updating fee:", error);
      setFeeMessage("Could not update royalty fee. Please try again.");
    } finally {
      setIsSavingFee(false);
    }
  };

  const userSeries = useMemo(
    () => buildDailySeries(usersData?.registrationData ?? []),
    [usersData]
  );
  const guideSeries = useMemo(
    () => buildDailySeries(guidesData?.registrationData ?? []),
    [guidesData]
  );

  const newUsers14Days = useMemo(() => sumSeries(userSeries), [userSeries]);
  const newGuides14Days = useMemo(() => sumSeries(guideSeries), [guideSeries]);

  const totalProfiles = (stats?.totalUsers || 0) + (stats?.totalGuides || 0);
  const usersShare = totalProfiles > 0 ? ((stats?.totalUsers || 0) / totalProfiles) * 100 : 0;
  const guidesShare = totalProfiles > 0 ? ((stats?.totalGuides || 0) / totalProfiles) * 100 : 0;

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!session || !hasAdminAccess(session.user)) {
    return null;
  }

  if (!stats || !usersData || !guidesData) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-rose-700">
        <p className="font-medium">Dashboard data is unavailable right now.</p>
        <p className="text-sm mt-1">Please try refreshing the page.</p>
        <button
          type="button"
          onClick={() => fetchDashboardData(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: "Pending Applications",
      value: formatNumber(stats.pendingApplications),
      icon: <ClipboardList className="h-5 w-5" />,
      href: "/admin/guide-applications",
      note: "Needs review",
    },
    {
      label: "Total Users",
      value: formatNumber(stats.totalUsers),
      icon: <User className="h-5 w-5" />,
      href: "/admin/users",
      note: `${formatNumber(newUsers14Days)} new in 14 days`,
    },
    {
      label: "Total Guides",
      value: formatNumber(stats.totalGuides),
      icon: <MapPinned className="h-5 w-5" />,
      href: "/admin/guides",
      note: `${formatNumber(newGuides14Days)} new in 14 days`,
    },
    {
      label: "Total Bookings",
      value: formatNumber(stats.totalBookings),
      icon: <CalendarDays className="h-5 w-5" />,
      href: "/admin/dashboard",
      note: "Platform-wide",
    },
    {
      label: "Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign className="h-5 w-5" />,
      href: "/admin/admin-fee",
      note: "Gross bookings value",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              Admin Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live operational snapshot of users, guides, and platform activity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {lastUpdatedAt && (
              <span className="text-xs text-slate-500" suppressHydrationWarning>
                Updated {lastUpdatedAt.toLocaleTimeString()}
              </span>
            )}
            <button
              type="button"
              onClick={() => fetchDashboardData(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg p-2 bg-slate-100 text-slate-700">
                {card.icon}
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-2 text-xs text-slate-500">{card.note}</p>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Growth Pulse</h2>
              <p className="text-sm text-slate-500">Last 14 days registrations</p>
            </div>
            <Users className="h-5 w-5 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700">Users</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {formatNumber(newUsers14Days)}
              </p>
              <p className="text-xs text-slate-500 mt-1">new profiles in 14 days</p>
              <div className="mt-3">
                <TrendMiniChart series={userSeries} tone="user" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700">Guides</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {formatNumber(newGuides14Days)}
              </p>
              <p className="text-xs text-slate-500 mt-1">new guide accounts in 14 days</p>
              <div className="mt-3">
                <TrendMiniChart series={guideSeries} tone="guide" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Profile Distribution</h2>
          <p className="text-sm text-slate-500 mt-1">Current user and guide mix</p>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Users</span>
                <span className="font-medium text-slate-900">{usersShare.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#A18167]"
                  style={{ width: `${usersShare}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Guides</span>
                <span className="font-medium text-slate-900">{guidesShare.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${guidesShare}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Profiles</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">
              {formatNumber(totalProfiles)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Newest Users</h3>
            <Link href="/admin/users" className="text-sm text-[#A18167] hover:text-[#8e6f56]">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {usersData.users.slice(0, 7).map((member) => (
              <div key={member.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {member.name || "Unnamed User"}
                  </p>
                  <p className="text-xs text-slate-500">{member.email || "No email"}</p>
                </div>
                <p className="text-xs text-slate-500" suppressHydrationWarning>
                  {formatDate(member.createdAt)}
                </p>
              </div>
            ))}
            {usersData.users.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-500">No users found.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Newest Guides</h3>
            <Link href="/admin/guides" className="text-sm text-[#A18167] hover:text-[#8e6f56]">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {guidesData.users.slice(0, 7).map((member) => (
              <div key={member.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {member.name || "Unnamed Guide"}
                  </p>
                  <p className="text-xs text-slate-500">{member.email || "No email"}</p>
                </div>
                <p className="text-xs text-slate-500" suppressHydrationWarning>
                  {formatDate(member.createdAt)}
                </p>
              </div>
            ))}
            {guidesData.users.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-500">No guides found.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivities.slice(0, 10).map((activity) => {
              const meta = getActivityMeta(activity.type);
              return (
                <div key={`${activity.type}-${activity.id}-${activity.date}`} className="px-5 py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`mt-0.5 inline-flex items-center justify-center rounded-md border p-1.5 ${meta.className}`}>
                      {meta.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-900 truncate">{activity.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{meta.badge}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600" suppressHydrationWarning>
                      {formatRelativeTime(activity.date)}
                    </p>
                    <p className="text-[11px] text-slate-400" suppressHydrationWarning>
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              );
            })}
            {recentActivities.length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-500">No recent activities.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
          <p className="text-sm text-slate-500 mt-1">Common admin operations</p>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <Link
              href="/admin/guide-applications"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Review pending applications
            </Link>
            <Link
              href="/admin/users"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Manage users
            </Link>
            <Link
              href="/admin/guides"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Manage guides
            </Link>
            <Link
              href="/admin/withdrawals"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Process withdrawals
            </Link>
            <Link
              href="/admin/admin-fee"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Update fee settings
            </Link>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900">Royalty Fee Control</h4>
            <p className="text-xs text-slate-500 mt-1">
              Current fee:{" "}
              <span className="font-semibold text-slate-700">
                {feeRatePercent !== null ? `${feeRatePercent.toFixed(2)}%` : "--"}
              </span>
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustFeeInput(-1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Decrease fee by 1 percent"
              >
                <Minus className="h-4 w-4" />
              </button>

              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={feeInput}
                onChange={(event) => {
                  setFeeInput(event.target.value);
                  setFeeMessage(null);
                }}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A18167]/40 focus:border-[#A18167]"
                placeholder="Enter fee %"
              />

              <button
                type="button"
                onClick={() => adjustFeeInput(1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Increase fee by 1 percent"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveFee}
              disabled={isSavingFee}
              className="mt-2 w-full inline-flex items-center justify-center rounded-lg bg-[#A18167] px-3 py-2 text-sm font-semibold text-white hover:bg-[#8e6f56] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isSavingFee ? "Saving..." : "Save Royalty Fee"}
            </button>

            {feeMessage && (
              <p
                className={`mt-2 text-xs ${
                  feeMessage.toLowerCase().includes("success")
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {feeMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
