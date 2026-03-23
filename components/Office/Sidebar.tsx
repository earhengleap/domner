"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { type ComponentType, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  ChevronRight,
  Compass,
  FileCheck2,
  HandCoins,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  UserRoundCheck,
  X,
} from "lucide-react";

interface SidebarStat {
  pendingApplications: number;
  totalBookings: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  matchPaths?: string[];
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: Home },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/guides", label: "Guides", icon: UserRoundCheck },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/admin/guide-applications",
        label: "Applications",
        icon: FileCheck2,
        matchPaths: ["/admin/applications"],
      },
      { href: "/admin/withdrawals", label: "Withdrawals", icon: HandCoins },
      { href: "/admin/admin-fee", label: "Platform Fee", icon: BadgeDollarSign },
    ],
  },
];

function isPathActive(pathname: string, item: NavItem) {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }
  if (item.matchPaths?.some((path) => pathname.startsWith(path))) {
    return true;
  }
  return false;
}

function SidebarPanel({
  pathname,
  userName,
  userEmail,
  quickStat,
  onNavigate,
}: {
  pathname: string;
  userName: string;
  userEmail: string;
  quickStat: SidebarStat | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="h-full w-full border-r border-slate-200 bg-white text-slate-900 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Domner
            </p>
            <h2 className="text-base font-semibold leading-tight text-slate-900">Admin Console</h2>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Signed in as</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{userName}</p>
          <p className="text-xs text-slate-600 truncate">{userEmail}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-2 text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-2">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isPathActive(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          active
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-500 group-hover:text-slate-700"}`} />
                          <span className="font-medium">{item.label}</span>
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            active
                              ? "text-white/80"
                              : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="px-5 py-4 border-t border-slate-200 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-[11px] text-slate-600">Pending Apps</p>
            <p className="text-base font-semibold text-slate-900 mt-1">
              {quickStat ? quickStat.pendingApplications.toLocaleString() : "--"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-[11px] text-slate-600">Bookings</p>
            <p className="text-base font-semibold text-slate-900 mt-1">
              {quickStat ? quickStat.totalBookings.toLocaleString() : "--"}
            </p>
          </div>
        </div>

        <Link
          href="/"
          onClick={onNavigate}
          className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Compass className="h-3.5 w-3.5" />
          Back To Site
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickStat, setQuickStat] = useState<SidebarStat | null>(null);

  const userName = useMemo(() => session?.user?.name || "Admin User", [session]);
  const userEmail = useMemo(() => session?.user?.email || "No email", [session]);

  useEffect(() => {
    const loadQuickStat = async () => {
      try {
        const response = await fetch("/api/admin/dashboardStats", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        setQuickStat({
          pendingApplications: Number(payload?.pendingApplications || 0),
          totalBookings: Number(payload?.totalBookings || 0),
        });
      } catch (error) {
        console.error("Failed to load sidebar stats:", error);
      }
    };

    loadQuickStat();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="md:hidden fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Domner</p>
              <p className="text-sm font-semibold text-slate-900">Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <aside className="hidden md:block md:w-72 md:shrink-0">
        <div className="sticky top-0 h-screen">
          <SidebarPanel
            pathname={pathname}
            userName={userName}
            userEmail={userEmail}
            quickStat={quickStat}
          />
        </div>
      </aside>

      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-200 ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[86vw] max-w-[320px] transform transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-1 text-slate-700 shadow-sm"
            aria-label="Close sidebar menu"
          >
            <X className="h-4 w-4" />
          </button>
          <SidebarPanel
            pathname={pathname}
            userName={userName}
            userEmail={userEmail}
            quickStat={quickStat}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </div>
    </>
  );
}
