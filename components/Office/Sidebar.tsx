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
    <div className="h-full w-full bg-[#131313] text-slate-100 border-r border-white/10 flex flex-col">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#A18167] text-white flex items-center justify-center shadow-lg shadow-[#A18167]/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/50">
              Domner
            </p>
            <h2 className="text-lg font-semibold leading-tight">Admin Console</h2>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs uppercase tracking-wide text-white/60">Signed in as</p>
          <p className="mt-1 text-sm font-semibold text-white truncate">{userName}</p>
          <p className="text-xs text-white/60 truncate">{userEmail}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-2 text-[11px] uppercase tracking-[0.14em] text-white/45 mb-2">
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
                            ? "bg-white text-[#1f1f1f]"
                            : "text-white/75 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className={`h-4 w-4 ${active ? "text-[#A18167]" : ""}`} />
                          <span className="font-medium">{item.label}</span>
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            active
                              ? "text-[#A18167]"
                              : "text-white/35 group-hover:text-white/60"
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

      <div className="px-4 py-4 border-t border-white/10 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            <p className="text-[11px] text-white/60">Pending Apps</p>
            <p className="text-base font-semibold mt-1">
              {quickStat ? quickStat.pendingApplications.toLocaleString() : "--"}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            <p className="text-[11px] text-white/60">Bookings</p>
            <p className="text-base font-semibold mt-1">
              {quickStat ? quickStat.totalBookings.toLocaleString() : "--"}
            </p>
          </div>
        </div>

        <Link
          href="/"
          onClick={onNavigate}
          className="inline-flex items-center gap-2 text-xs text-white/65 hover:text-white transition-colors"
        >
          <Compass className="h-3.5 w-3.5" />
          Back To Site
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/20 transition-colors"
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

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white/95 px-2.5 py-2 text-slate-700 shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden lg:flex lg:w-72 lg:min-h-screen lg:sticky lg:top-0 lg:self-start">
        <SidebarPanel
          pathname={pathname}
          userName={userName}
          userEmail={userEmail}
          quickStat={quickStat}
        />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[86vw]">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-md border border-white/20 bg-black/20 p-1 text-white"
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
      )}
    </>
  );
}
