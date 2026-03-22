"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, ChevronRight, Menu, X } from "lucide-react";
import Logo from "@/public/DomnerDesktop.png";
import GuideProfileAvatar from "../GuideProfileAvatar";
import { Button } from "../ui/button";
import { hasGuideAccess } from "@/lib/access";

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  bookingDetails?: string;
}

const NAV_ITEMS = [
  { href: "/guide-dashboard", label: "Dashboard" },
  { href: "/guide-dashboard/create-post", label: "Create" },
  { href: "/guide-dashboard/manage", label: "Manage" },
  { href: "/guide/booking-history", label: "Bookings" },
  { href: "/guide-dashboard/cancel-requests", label: "Requests" },
  { href: "/guide-dashboard/finance", label: "Finance" },
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/guide-dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatNotificationMessage(notification: Notification) {
  try {
    const details = notification.bookingDetails
      ? JSON.parse(notification.bookingDetails)
      : null;

    if (notification.type === "booking" && details?.name) {
      return `${details.name} made a booking.`;
    }

    if (notification.type === "booking_cancel_request") {
      return notification.message || "A traveler requested a cancellation review.";
    }

    if (notification.type === "booking_change_request") {
      return notification.message || "A traveler requested booking changes.";
    }
  } catch {
    return notification.message;
  }

  return notification.message;
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"unread" | "all">("unread");

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowNotifications(false);
  }, [pathname]);

  useEffect(() => {
    if (!showNotifications || status !== "authenticated") {
      return;
    }

    let cancelled = false;

    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications?limit=12", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load notifications");
        }

        const data = await response.json();

        if (!cancelled) {
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    void fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 60000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [showNotifications, status]);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const isLoggedIn = status === "authenticated";
  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  );
  const visibleNotifications = notifications.filter(
    (notification) => activeTab === "all" || !notification.isRead
  );

  return (
    <nav className="fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-5">
      <div
        className={`mx-auto max-w-7xl rounded-[1.75rem] border transition-all duration-300 ${
          scrolled
            ? "border-[#d7c0af] bg-white/94 shadow-[0_14px_40px_rgba(39,26,16,0.12)] backdrop-blur-xl"
            : "border-white/60 bg-white/88 shadow-[0_8px_30px_rgba(39,26,16,0.08)] backdrop-blur-lg"
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/guide-dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5ede6] shadow-inner">
              <img
                src={Logo.src}
                width={30}
                height={30}
                className="h-8 w-auto"
                alt="Domner Logo"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[#A18167]">
                Guide Console
              </div>
              <div className="text-sm font-semibold text-slate-900">
                Professional Workspace
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = isRouteActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#2f251d] text-white shadow-[0_10px_24px_rgba(47,37,29,0.18)]"
                      : "text-slate-600 hover:bg-[#f7efe8] hover:text-[#2f251d]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {mounted && isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications((current) => !current)}
                  className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${
                    showNotifications
                      ? "border-[#A18167] bg-[#f7efe8] text-[#2f251d]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#d7c0af] hover:bg-[#fcf7f2]"
                  }`}
                  aria-label="Open notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-[22rem] overflow-hidden rounded-3xl border border-[#eadfd6] bg-white shadow-[0_22px_60px_rgba(35,25,17,0.18)]">
                    <div className="border-b border-[#f0e4da] px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Notifications
                          </p>
                          <p className="text-xs text-slate-500">
                            Updates from bookings and traveler requests
                          </p>
                        </div>
                        <span className="rounded-full bg-[#f7efe8] px-2.5 py-1 text-xs font-medium text-[#A18167]">
                          {unreadNotifications.length} unread
                        </span>
                      </div>
                      <div className="mt-4 flex rounded-full bg-[#f8f3ee] p-1">
                        {(["unread", "all"] as const).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-all ${
                              activeTab === tab
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {tab === "unread" ? "Unread" : "All"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="max-h-[24rem] overflow-y-auto px-2 py-2">
                      {visibleNotifications.length > 0 ? (
                        visibleNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`mx-2 mb-2 rounded-2xl border px-4 py-3 transition ${
                              notification.isRead
                                ? "border-transparent bg-[#fbf8f5]"
                                : "border-[#eadfd6] bg-white shadow-sm"
                            }`}
                          >
                            <p className="text-sm font-medium text-slate-800">
                              {formatNotificationMessage(notification)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                            {!notification.isRead && (
                              <button
                                type="button"
                                onClick={() => markAsRead(notification.id)}
                                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#A18167] transition hover:text-[#2f251d]"
                              >
                                Mark as read
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-10 text-center text-sm text-slate-500">
                          No notifications in this view.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : mounted ? (
              <Button
                className="rounded-full bg-[#A18167] px-5 text-white hover:bg-[#2f251d]"
                asChild
              >
                <Link href="/login">Log in</Link>
              </Button>
            ) : (
              <div className="h-11 w-11 rounded-full bg-primary/10" />
            )}

            {mounted && isLoggedIn ? (
              <GuideProfileAvatar session={session} />
            ) : null}

            <button
              type="button"
              onClick={() => setShowMobileMenu((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#d7c0af] hover:bg-[#fcf7f2] lg:hidden"
              aria-label="Toggle guide navigation"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            showMobileMenu ? "max-h-[32rem] border-t border-[#f0e4da]" : "max-h-0"
          }`}
        >
          <div className="space-y-2 px-4 py-4 sm:px-6">
            {NAV_ITEMS.map((item) => {
              const active = isRouteActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#2f251d] text-white shadow-sm"
                      : "bg-[#fcf7f2] text-slate-700 hover:bg-[#f7efe8]"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
