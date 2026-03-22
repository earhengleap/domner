"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  Compass,
  Download,
  Home,
  MapPin,
  Receipt,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type BookingDetails = {
  id: string;
  date: string;
  adultCount: number;
  status: string;
  totalPrice: number;
  feeAmount: number;
  createdAt: string;
  guidePost: {
    title: string;
    location: string;
    type: string;
    guideName: string;
  };
};

function formatDateTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function downloadReceipt(booking: BookingDetails) {
  const receiptHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booking Receipt ${booking.id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
    .card { max-width: 760px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; padding: 28px; }
    .muted { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: .14em; }
    .row { display: flex; justify-content: space-between; margin: 12px 0; gap: 16px; }
    .section { margin-top: 28px; }
    h1 { margin: 8px 0 0; font-size: 28px; }
    h2 { font-size: 16px; margin: 0 0 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="muted">Booking Receipt</div>
    <h1>${booking.guidePost.title}</h1>
    <p>${booking.guidePost.location}</p>
    <div class="section">
      <h2>Booking</h2>
      <div class="row"><span>Receipt ID</span><strong>${booking.id}</strong></div>
      <div class="row"><span>Guide</span><strong>${booking.guidePost.guideName}</strong></div>
      <div class="row"><span>Trip Type</span><strong>${booking.guidePost.type}</strong></div>
      <div class="row"><span>Travel Date</span><strong>${formatDateTime(booking.date)}</strong></div>
      <div class="row"><span>Guests</span><strong>${booking.adultCount}</strong></div>
      <div class="row"><span>Booked On</span><strong>${formatDateTime(booking.createdAt)}</strong></div>
      <div class="row"><span>Status</span><strong>${booking.status}</strong></div>
    </div>
    <div class="section">
      <h2>Payment</h2>
      <div class="row"><span>Guide Amount</span><strong>$${(booking.totalPrice - booking.feeAmount).toFixed(2)}</strong></div>
      <div class="row"><span>Platform Fee</span><strong>$${booking.feeAmount.toFixed(2)}</strong></div>
      <div class="row"><span>Total Paid</span><strong>$${booking.totalPrice.toFixed(2)}</strong></div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([receiptHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `booking-receipt-${booking.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function BookingSuccessContent() {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        toast({
          title: "Error",
          description: "No booking ID provided. Please check your booking confirmation email.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/bookings/${bookingId}`);
        setBooking(response.data);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast({
          title: "Error",
          description: "Failed to load booking details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchBookingDetails();
  }, [bookingId, toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f1]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#A18167]" />
          <p className="mt-4 text-sm text-slate-500">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f1] px-4">
        <Card className="w-full max-w-lg rounded-[2rem] border-[#eadfd6] text-center shadow-sm">
          <CardContent className="space-y-4 p-8">
            <p className="text-xl font-semibold text-rose-600">Booking information unavailable</p>
            <p className="text-sm text-slate-500">We could not load the booking receipt for this payment.</p>
            <Button onClick={() => router.push("/")} className="rounded-full bg-[#2f251d] text-white hover:bg-[#1f1812]">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(161,129,103,0.12),_transparent_26%),linear-gradient(180deg,_#f8f6f2_0%,_#ffffff_46%,_#f5faf7_100%)] px-4 pb-10 pt-28 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="overflow-hidden rounded-[2rem] border-[#eadfd6] shadow-sm">
          <CardHeader className="bg-[linear-gradient(135deg,_#f8fcf8_0%,_#ffffff_55%,_#f7fbfd_100%)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Booking Confirmed
                </div>
                <CardTitle className="mt-4 text-3xl font-semibold tracking-tight text-[#2f251d]">
                  Payment completed successfully
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Your booking is now confirmed. Keep this page as your minimalist receipt summary or download the full receipt.
                </CardDescription>
              </div>
              <div className="rounded-[1.5rem] border border-[#eadfd6] bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total paid</p>
                <p className="mt-2 text-3xl font-semibold text-[#2f251d]">${booking.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <Card className="rounded-[2rem] border-[#eadfd6] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#2f251d]">Trip summary</CardTitle>
              <CardDescription>The essential booking information for this payment.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#eadfd6] bg-[#fffaf6] p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Trip</p>
                <p className="mt-2 text-xl font-semibold text-[#2f251d]">{booking.guidePost.title}</p>
              </div>
              <div className="rounded-2xl border border-[#eadfd6] bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="h-4 w-4 text-[#A18167]" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="mt-2 font-medium text-[#2f251d]">{booking.guidePost.location}</p>
              </div>
              <div className="rounded-2xl border border-[#eadfd6] bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Compass className="h-4 w-4 text-[#A18167]" />
                  <span className="text-sm">Trip Type</span>
                </div>
                <p className="mt-2 font-medium text-[#2f251d]">{booking.guidePost.type}</p>
              </div>
              <div className="rounded-2xl border border-[#eadfd6] bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarDays className="h-4 w-4 text-[#A18167]" />
                  <span className="text-sm">Travel Date</span>
                </div>
                <p className="mt-2 font-medium text-[#2f251d]">{formatDateTime(booking.date)}</p>
              </div>
              <div className="rounded-2xl border border-[#eadfd6] bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Users className="h-4 w-4 text-[#A18167]" />
                  <span className="text-sm">Guests</span>
                </div>
                <p className="mt-2 font-medium text-[#2f251d]">{booking.adultCount}</p>
              </div>
              <div className="rounded-2xl border border-[#eadfd6] bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <UserRound className="h-4 w-4 text-[#A18167]" />
                  <span className="text-sm">Guide</span>
                </div>
                <p className="mt-2 font-medium text-[#2f251d]">{booking.guidePost.guideName}</p>
              </div>
              <div className="rounded-2xl border border-[#eadfd6] bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Receipt className="h-4 w-4 text-[#A18167]" />
                  <span className="text-sm">Receipt ID</span>
                </div>
                <p className="mt-2 break-all font-mono text-sm font-medium text-[#2f251d]">{booking.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-[#eadfd6] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#2f251d]">Payment receipt</CardTitle>
              <CardDescription>Minimal receipt details for this completed booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-[#eadfd6] bg-white p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-emerald-700">{booking.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Booked on</span>
                  <span className="font-medium text-[#2f251d]">{formatDateTime(booking.createdAt)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#eadfd6] bg-white p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Guide amount</span>
                  <span className="font-medium text-[#2f251d]">${(booking.totalPrice - booking.feeAmount).toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Platform fee</span>
                  <span className="font-medium text-[#2f251d]">${booking.feeAmount.toFixed(2)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#f0e7df] pt-4">
                  <span className="font-medium text-[#2f251d]">Total paid</span>
                  <span className="text-2xl font-semibold text-[#2f251d]">${booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f8fafb] p-4 text-sm leading-6 text-slate-600">
                Your payment has been recorded and the trip reservation is confirmed. Download the receipt if you need a copy for your records.
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => downloadReceipt(booking)}
                  variant="outline"
                  className="h-12 rounded-full border-[#d7c0af] hover:bg-[#fffaf6]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download receipt
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  className="h-12 rounded-full bg-[#2f251d] text-white hover:bg-[#1f1812]"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f7f5f1]">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#A18167]" />
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
