import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { CalendarDays, MapPin, Receipt, Users } from "lucide-react";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BookingDetail = {
  id: string;
  userId: string;
  date: Date;
  adultCount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  totalPrice: number;
  feeAmount: number;
  createdAt: Date;
  guidePost: {
    id: string;
    title: string;
    location: string;
    type: string;
    price: number;
    userId: string;
    guideName: string;
  };
  cancelRequest: {
    status: string;
    reason: string;
    requestedAt: string;
    resolvedAt?: string;
  } | null;
  changeRequest: {
    status: string;
    reason: string;
    requestedAt: string;
  } | null;
};

function getStatusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

async function getBooking(id: string): Promise<BookingDetail | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      guidePost: {
        select: {
          id: true,
          title: true,
          location: true,
          type: true,
          price: true,
          userId: true,
          user: {
            select: {
              name: true,
              guideProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!booking || booking.userId !== session.user.id) {
    return null;
  }

  const notifications = await (prisma as any).notification.findMany({
    where: {
      actorId: session.user.id,
      relatedPostId: booking.id,
        type: {
          in: ["booking_cancel_request", "booking_cancel_request_result", "booking_change_request"],
        },
      },
    orderBy: {
      createdAt: "desc",
    },
  });

  let cancelRequest: {
    status: string;
    reason: string;
    requestedAt: string;
    resolvedAt?: string;
  } | null = null;
  let changeRequest: {
    status: string;
    reason: string;
    requestedAt: string;
  } | null = null;

  for (const notification of notifications) {
    let details: any = {};
    try {
      details = notification.bookingDetails
        ? JSON.parse(notification.bookingDetails)
        : {};
    } catch {
      details = {};
    }

    if (notification.type?.startsWith("booking_cancel_request") && details.status) {
      cancelRequest = {
        status: details.status,
        reason: details.reason || "",
        requestedAt: details.requestedAt || notification.createdAt.toISOString(),
        resolvedAt: details.resolvedAt,
      };
    }

    if (notification.type === "booking_change_request" && details.status && !changeRequest) {
      changeRequest = {
        status: details.status,
        reason: details.reason || "",
        requestedAt: details.requestedAt || notification.createdAt.toISOString(),
      };
    }

    if (cancelRequest && changeRequest) {
      break;
    }
  }

  return {
    ...booking,
    guidePost: {
      ...booking.guidePost,
      guideName:
        booking.guidePost.user?.guideProfile
          ? `${booking.guidePost.user.guideProfile.firstName} ${booking.guidePost.user.guideProfile.lastName}`.trim()
          : booking.guidePost.user?.name || "Guide",
    },
    cancelRequest,
    changeRequest,
  };
}

export default async function UserBookingDetailPage({
  bookingId,
}: {
  bookingId: string;
}) {
  const booking = await getBooking(bookingId);

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] px-4 py-32">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Booking not found.</p>
              <div className="mt-4">
                <Button asChild variant="outline">
                  <Link href="/booking-history">Back to booking history</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf9] px-4 py-32">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#A18167]">
              Booking Details
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#A18167]">
              {booking.guidePost.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Inspect the exact booking date you selected, payment totals, and any cancellation activity.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/booking-history">Back to history</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>Trip Snapshot</CardTitle>
              <CardDescription>
                Core booking information at a glance.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Selected booking date
                </p>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
                  <CalendarDays className="h-5 w-5 text-[#A18167]" />
                  {new Date(booking.date).toLocaleDateString()}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Booking created date
                </p>
                <div className="mt-2 text-lg font-semibold">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5 text-[#A18167]" />
                  {booking.guidePost.location}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Guide
                </p>
                <div className="mt-2 text-lg font-semibold text-[#A18167]">
                  {booking.guidePost.guideName}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Travelers
                </p>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5 text-[#A18167]" />
                  {booking.adultCount} guest{booking.adultCount > 1 ? "s" : ""}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Current booking lifecycle information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge className={getStatusClasses(booking.status)}>
                {booking.status}
              </Badge>

              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Trip type
                </p>
                <p className="mt-2 text-base font-semibold">
                  {booking.guidePost.type}
                </p>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Booking ID
                </p>
                <p className="mt-2 break-all font-mono text-sm">
                  {booking.id}
                </p>
              </div>
              {booking.status === "PENDING" && (
                <div className="rounded-xl border bg-white p-4 text-sm text-muted-foreground">
                  Pending bookings cannot be edited directly. Send a request to the guide from booking history if you need changes.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Professional breakdown of the booking amount recorded in the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border bg-white p-4">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-[#A18167]" />
                  <span className="font-medium">Guide price per booking</span>
                </div>
                <span className="font-semibold">
                  ${booking.guidePost.price.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-white p-4">
                <span className="font-medium">Platform fee</span>
                <span className="font-semibold">${booking.feeAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-white p-4">
                <span className="font-medium">Total charged</span>
                <span className="text-xl font-bold text-[#A18167]">
                  ${booking.totalPrice.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guide Request Activity</CardTitle>
              <CardDescription>
                Track requests sent to the guide for this booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.changeRequest ? (
                <>
                  <Badge className={getStatusClasses(booking.changeRequest.status)}>
                    Change Request {booking.changeRequest.status}
                  </Badge>
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Requested on
                    </p>
                    <p className="mt-2 font-semibold">
                      {new Date(booking.changeRequest.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Request details
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      {booking.changeRequest.reason}
                    </p>
                  </div>
                </>
              ) : booking.cancelRequest ? (
                <>
                  <Badge className={getStatusClasses(booking.cancelRequest.status)}>
                    {booking.cancelRequest.status}
                  </Badge>
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Requested on
                    </p>
                    <p className="mt-2 font-semibold">
                      {new Date(booking.cancelRequest.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Reason
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      {booking.cancelRequest.reason || "No reason provided."}
                    </p>
                  </div>
                  {booking.cancelRequest.resolvedAt && (
                    <div className="rounded-xl border bg-white p-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Resolved on
                      </p>
                      <p className="mt-2 font-semibold">
                        {new Date(booking.cancelRequest.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border bg-white p-4 text-sm text-muted-foreground">
                  No guide request has been submitted for this booking.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
