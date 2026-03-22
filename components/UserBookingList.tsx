'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";

interface Booking {
  id: string;
  guidePost: {
    userId: string;
    title: string;
    location: string;
    guideName: string;
  };
  date: string;
  adultCount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  totalPrice: number;
  feeAmount: number;
  createdAt: string;
  cancelRequest: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reason: string;
    requestedAt: string;
    resolvedAt?: string;
  } | null;
  changeRequest: {
    id: string;
    status: "PENDING";
    reason: string;
    requestedAt: string;
  } | null;
}

type BookingFilter = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED";
type BookingSort = "NEWEST" | "OLDEST" | "BOOKING_DATE_ASC" | "BOOKING_DATE_DESC";

export default function UserBookingList() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingFilter>("ALL");
  const [sortBy, setSortBy] = useState<BookingSort>("NEWEST");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/booking-history");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestGuideChange = async (bookingId: string) => {
    const reason = window.prompt(
      "Describe what you want the guide to change for this pending booking:"
    );

    if (reason === null) {
      return;
    }

    try {
      setBusyId(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}/change-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to request changes");
      }

      toast({
        title: "Request sent",
        description: "The guide has been notified and can review your requested changes.",
      });

      await fetchBookings();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to request changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleRequestCancellation = async (bookingId: string) => {
    const reason = window.prompt(
      "Add an optional cancellation reason for the guide:"
    );

    if (reason === null) {
      return;
    }

    try {
      setBusyId(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}/cancel-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to request cancellation");
      }

      toast({
        title: "Request sent",
        description: "The guide can now approve or reject your cancellation request.",
      });

      await fetchBookings();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to request cancellation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "bg-yellow-500",
      CONFIRMED: "bg-green-500",
      CANCELLED: "bg-red-500",
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const getCancelRequestBadge = (booking: Booking) => {
    if (!booking.cancelRequest) {
      return null;
    }

    const variants = {
      PENDING: "bg-amber-100 text-amber-800",
      APPROVED: "bg-emerald-100 text-emerald-800",
      REJECTED: "bg-rose-100 text-rose-800",
    };

    return (
      <Badge className={variants[booking.cancelRequest.status]}>
        Cancel Request {booking.cancelRequest.status}
      </Badge>
    );
  };

  const getChangeRequestBadge = (booking: Booking) => {
    if (!booking.changeRequest) {
      return null;
    }

    return (
      <Badge className="bg-sky-100 text-sky-800">
        Guide Request {booking.changeRequest.status}
      </Badge>
    );
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "ALL") {
      return (
        normalizedSearch.length === 0 ||
        booking.guidePost.title.toLowerCase().includes(normalizedSearch) ||
        booking.guidePost.location.toLowerCase().includes(normalizedSearch) ||
        booking.guidePost.guideName.toLowerCase().includes(normalizedSearch)
      );
    }

    const matchesFilter = booking.status === filter;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      booking.guidePost.title.toLowerCase().includes(normalizedSearch) ||
      booking.guidePost.location.toLowerCase().includes(normalizedSearch) ||
      booking.guidePost.guideName.toLowerCase().includes(normalizedSearch);

    return matchesFilter && matchesSearch;
  }).sort((left, right) => {
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking History</CardTitle>
        <CardDescription>
          Review your bookings, search by guide or tour, and manage each trip with a cleaner history view.
        </CardDescription>
        <div className="grid gap-3 pt-2 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by guide, tour, or location"
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
        </div>
      </CardHeader>
      <CardContent>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {bookings.length === 0
                ? "No bookings found"
                : `No ${filter.toLowerCase()} bookings matched your current search`}
            </p>
          </div>
        ) : (
          <>
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredBookings.length} booking{filteredBookings.length > 1 ? "s" : ""} shown</span>
            <span className="hidden md:inline">Tap a row to open the full booking details</span>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour Details</TableHead>
                  <TableHead>Guide</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  return (
                    <TableRow key={booking.id}>
                      <TableCell
                        className="cursor-pointer"
                        onClick={() => router.push(`/booking-history/${booking.id}`)}
                      >
                        <div className="space-y-2">
                          <div className="font-medium">{booking.guidePost.title}</div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-4 w-4" />
                            {booking.guidePost.location}
                          </div>
                          {getCancelRequestBadge(booking)}
                          {getChangeRequestBadge(booking)}
                        </div>
                      </TableCell>
                      <TableCell
                        className="cursor-pointer"
                        onClick={() => router.push(`/booking-history/${booking.id}`)}
                      >
                        <div className="font-medium text-[#A18167]">{booking.guidePost.guideName}</div>
                      </TableCell>
                      <TableCell
                        className="cursor-pointer"
                        onClick={() => router.push(`/booking-history/${booking.id}`)}
                      >
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell
                        className="cursor-pointer"
                        onClick={() => router.push(`/booking-history/${booking.id}`)}
                      >
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {booking.adultCount}
                        </div>
                      </TableCell>
                      <TableCell
                        className="cursor-pointer"
                        onClick={() => router.push(`/booking-history/${booking.id}`)}
                      >
                        ${booking.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className="cursor-pointer"
                        onClick={() => router.push(`/booking-history/${booking.id}`)}
                      >
                        {getStatusBadge(booking.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {booking.status === "PENDING" && !booking.changeRequest && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === booking.id}
                                onClick={() => handleRequestGuideChange(booking.id)}
                              >
                                Request Guide Changes
                              </Button>
                            </>
                          )}

                          {booking.status === "PENDING" && booking.changeRequest && (
                            <span className="text-sm text-muted-foreground">
                              Waiting for guide response
                            </span>
                          )}

                          {booking.status === "CONFIRMED" &&
                            !booking.cancelRequest && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === booking.id}
                                onClick={() =>
                                  handleRequestCancellation(booking.id)
                                }
                              >
                                Request Cancellation
                              </Button>
                            )}

                          {booking.status === "CONFIRMED" &&
                            booking.cancelRequest?.status === "PENDING" && (
                              <span className="text-sm text-muted-foreground">
                                Waiting for guide review
                              </span>
                            )}

                          {booking.cancelRequest?.status === "REJECTED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === booking.id}
                              onClick={() =>
                                handleRequestCancellation(booking.id)
                              }
                            >
                              Request Again
                            </Button>
                          )}

                          {booking.status === "CANCELLED" && (
                            <span className="text-sm text-muted-foreground">
                              Cancelled booking
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-4 md:hidden">
            {filteredBookings.map((booking) => {
              return (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-[#eadfd6] bg-white p-4 shadow-sm"
                >
                  <button
                    type="button"
                    className="w-full cursor-pointer text-left"
                    onClick={() => router.push(`/booking-history/${booking.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-[#2f251d]">{booking.guidePost.title}</p>
                        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.guidePost.location}</span>
                        </div>
                        <p className="mt-1 text-sm text-[#A18167]">Guide: {booking.guidePost.guideName}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </button>

                  <div className="mt-4 grid gap-3 rounded-xl bg-[#fcf7f2] p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Selected date</span>
                      <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Guests</span>
                      <span className="font-medium">{booking.adultCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold">${booking.totalPrice.toFixed(2)}</span>
                    </div>
                    {getCancelRequestBadge(booking)}
                    {getChangeRequestBadge(booking)}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {booking.status === "PENDING" && !booking.changeRequest && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === booking.id}
                        onClick={() => handleRequestGuideChange(booking.id)}
                      >
                        Request Guide Changes
                      </Button>
                    )}

                    {booking.status === "PENDING" && booking.changeRequest && (
                      <span className="text-sm text-muted-foreground">
                        Waiting for guide response
                      </span>
                    )}

                    {booking.status === "CONFIRMED" && !booking.cancelRequest && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === booking.id}
                        onClick={() => handleRequestCancellation(booking.id)}
                      >
                        Request Cancellation
                      </Button>
                    )}

                    {booking.status === "CONFIRMED" &&
                      booking.cancelRequest?.status === "PENDING" && (
                        <span className="text-sm text-muted-foreground">
                          Waiting for guide review
                        </span>
                      )}

                    {booking.cancelRequest?.status === "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === booking.id}
                        onClick={() => handleRequestCancellation(booking.id)}
                      >
                        Request Again
                      </Button>
                    )}

                    {booking.status === "CANCELLED" && (
                      <span className="text-sm text-muted-foreground">
                        Cancelled booking
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
