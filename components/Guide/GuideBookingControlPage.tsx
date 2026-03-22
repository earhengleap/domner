'use client'

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Users, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface GuideBooking {
  id: string;
  date: string;
  adultCount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  totalPrice: number;
  feeAmount: number;
  createdAt: string;
  guidePost: {
    id: string;
    title: string;
    location: string;
    type: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  cancelRequest: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reason: string;
    requestedAt: string;
  } | null;
}

type BookingFilter = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED";
type BookingSort = "NEWEST" | "OLDEST" | "BOOKING_DATE_ASC" | "BOOKING_DATE_DESC";

function statusBadge(status: GuideBooking["status"]) {
  const classes = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return <Badge className={classes[status]}>{status}</Badge>;
}

export default function GuideBookingControlPage() {
  const [bookings, setBookings] = useState<GuideBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingFilter>("ALL");
  const [sortBy, setSortBy] = useState<BookingSort>("NEWEST");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const response = await fetch("/api/guide/bookings");
      if (!response.ok) {
        throw new Error("Failed to load guide bookings");
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load guide bookings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmBooking(bookingId: string) {
    try {
      setBusyId(bookingId);
      const response = await fetch(`/api/guide/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to confirm booking");
      }

      toast({
        title: "Booking confirmed",
        description: "The traveler has been notified.",
      });

      await fetchBookings();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to confirm booking",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const matchesFilter = filter === "ALL" || booking.status === filter;
        const travelerName = booking.user.name || booking.user.email || "";
        const matchesSearch =
          normalizedSearch.length === 0 ||
          travelerName.toLowerCase().includes(normalizedSearch) ||
          booking.guidePost.title.toLowerCase().includes(normalizedSearch) ||
          booking.guidePost.location.toLowerCase().includes(normalizedSearch);

        return matchesFilter && matchesSearch;
      })
      .sort((left, right) => {
        if (sortBy === "OLDEST") {
          return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
        }

        if (sortBy === "BOOKING_DATE_ASC") {
          return new Date(left.date).getTime() - new Date(right.date).getTime();
        }

        if (sortBy === "BOOKING_DATE_DESC") {
          return new Date(right.date).getTime() - new Date(left.date).getTime();
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });
  }, [bookings, filter, normalizedSearch, sortBy]);

  const stats = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc.total += 1;
        acc.revenue += booking.status === "CANCELLED" ? 0 : booking.totalPrice;
        if (booking.status === "PENDING") acc.pending += 1;
        if (booking.status === "CONFIRMED") acc.confirmed += 1;
        if (booking.status === "CANCELLED") acc.cancelled += 1;
        if (booking.cancelRequest?.status === "PENDING") acc.cancelRequests += 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        cancelRequests: 0,
        revenue: 0,
      }
    );
  }, [bookings]);

  if (isLoading) {
    return <div className="loader" />;
  }

  return (
    <div className="min-h-screen bg-[#fdfbf9] px-4 py-32">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#A18167]">
            Guide Booking Control
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#A18167]">
            Manage Incoming Bookings
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Review every traveler booking, confirm pending requests, and jump straight to cancellation approvals when needed.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card><CardHeader><CardTitle className="text-base">Total Bookings</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.total}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Pending</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.pending}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Confirmed</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.confirmed}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Cancelled</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.cancelled}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Open Cancel Requests</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.cancelRequests}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bookings Overview</CardTitle>
            <CardDescription>
              Search by traveler, tour, or location, then filter and sort to focus on what needs action.
            </CardDescription>
            <div className="grid gap-3 pt-2 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by traveler, tour, or location"
                  className="h-11 w-full rounded-xl border border-[#d7c0af] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#A18167] focus:ring-2 focus:ring-[#A18167]/20"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#eadfd6] bg-[#fffaf6] px-3 py-2">
                <SlidersHorizontal className="h-4 w-4 text-[#A18167]" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as BookingSort)}
                  className="h-9 w-full bg-transparent text-sm outline-none"
                >
                  <option value="NEWEST">Newest added</option>
                  <option value="OLDEST">Oldest added</option>
                  <option value="BOOKING_DATE_ASC">Booking date: earliest</option>
                  <option value="BOOKING_DATE_DESC">Booking date: latest</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(["ALL", "PENDING", "CONFIRMED", "CANCELLED"] as BookingFilter[]).map(
                (value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={filter === value ? "default" : "outline"}
                    onClick={() => setFilter(value)}
                  >
                    {value === "ALL" ? "All" : value}
                  </Button>
                )
              )}
              <Button asChild size="sm" variant="outline">
                <Link href="/guide-dashboard/cancel-requests">Review Cancel Requests</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d7c0af] bg-[#fffaf6] p-10 text-center text-muted-foreground">
                No guide bookings matched the current filters.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredBookings.map((booking) => {
                  const travelerName = booking.user.name || booking.user.email || "Traveler";

                  return (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-[#eadfd6] bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-[#2f251d]">
                              {booking.guidePost.title}
                            </h3>
                            {statusBadge(booking.status)}
                            {booking.cancelRequest?.status === "PENDING" && (
                              <Badge className="bg-amber-100 text-amber-800">
                                Cancel request pending
                              </Badge>
                            )}
                          </div>
                          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#A18167]" />
                              <span>{booking.guidePost.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-[#A18167]" />
                              <span>{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-[#A18167]" />
                              <span>{booking.adultCount} guest{booking.adultCount > 1 ? "s" : ""}</span>
                            </div>
                            <div>
                              Booked on {new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="rounded-xl bg-[#fcf7f2] p-3 text-sm">
                            <p className="font-medium text-[#A18167]">Traveler</p>
                            <p className="mt-1 font-semibold text-[#2f251d]">{travelerName}</p>
                            <p className="text-muted-foreground">{booking.user.email || "No email"}</p>
                          </div>
                        </div>

                        <div className="min-w-[220px] space-y-3">
                          <div className="rounded-xl border bg-white p-4">
                            <p className="text-sm text-muted-foreground">Booking total</p>
                            <p className="mt-1 text-2xl font-bold text-[#A18167]">
                              ${booking.totalPrice.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Platform fee: ${booking.feeAmount.toFixed(2)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {booking.status === "PENDING" && (
                              <Button
                                disabled={busyId === booking.id}
                                onClick={() => confirmBooking(booking.id)}
                              >
                                Confirm Booking
                              </Button>
                            )}
                            {booking.cancelRequest?.status === "PENDING" && (
                              <Button asChild variant="outline">
                                <Link href="/guide-dashboard/cancel-requests">
                                  Review Request
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
