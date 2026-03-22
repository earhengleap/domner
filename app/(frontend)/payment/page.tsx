"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type PayWayData = {
  qrImage: string;
  qrString: string;
  abapay_deeplink: string;
  amount: string;
  tran_id?: string;
  app_store?: string;
  play_store?: string;
};

type BookingReceipt = {
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
  user?: {
    name?: string | null;
    email?: string | null;
  };
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function maskValue(value: string | null, visible = 6) {
  if (!value) {
    return "Unavailable";
  }

  if (value.length <= visible) {
    return value;
  }

  return `${value.slice(0, visible)}...${value.slice(-4)}`;
}

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

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isLoadingABA, setIsLoadingABA] = useState(false);
  const [paywayData, setPaywayData] = useState<PayWayData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [activeMethod, setActiveMethod] = useState<"overview" | "aba" | "paypal">("overview");
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [receiptData, setReceiptData] = useState<BookingReceipt | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    setOrderId(searchParams.get("orderId"));
    setBookingId(searchParams.get("bookingId"));
  }, [searchParams]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => (previous !== null && previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!paywayData?.tran_id || isPaid) {
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await axios.post(
          "/api/create-booking-and-paypal-order/check-transaction-payway",
          { tran_id: paywayData.tran_id }
        );

        const paymentStatusCode = response.data?.data?.payment_status_code;

        if (paymentStatusCode === 0 || paymentStatusCode === "0") {
          setIsPaid(true);
          await handlePaymentSuccess("aba");
        }
      } catch (error) {
        console.error("[ABA_PAYWAY_POLL] Error:", error);
      }
    };

    const interval = setInterval(pollStatus, 5000);

    return () => clearInterval(interval);
  }, [isPaid, paywayData?.tran_id]);

  const checkoutAmount = useMemo(() => {
    return paywayData?.amount ? `$${paywayData.amount}` : "Waiting for payment method";
  }, [paywayData?.amount]);

  const isMobileDevice = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent);
  }, []);

  const handlePaymentSuccess = async (method: "paypal" | "aba" = "paypal") => {
    try {
      setIsConfirmingPayment(true);
      const endpoint =
        method === "aba" ? "/api/confirm-aba-payment" : "/api/capture-paypal-payment";

      await axios.post(endpoint, { orderId, bookingId });

      const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
      setReceiptData(bookingResponse.data);
      setShowReceipt(true);

      toast({
        title: "Payment successful",
        description: "Your booking has been confirmed.",
      });
    } catch (error) {
      console.error(`${method} payment capture error:`, error);
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      setIsPaid(false);
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handleABAPayment = async () => {
    if (!bookingId) {
      toast({
        title: "Error",
        description: "Booking ID is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingABA(true);
    setPaywayData(null);
    setTimeLeft(null);
    setActiveMethod("aba");

    try {
      const response = await axios.post(
        "/api/create-booking-and-paypal-order/check-out-payway",
        { bookingId }
      );

      if (response.data.success && response.data.qrImage) {
        setPaywayData({
          qrImage: response.data.qrImage,
          qrString: response.data.qrString,
          abapay_deeplink: response.data.abapay_deeplink,
          amount: response.data.amount || "0.00",
          tran_id: response.data.status?.tran_id,
          app_store: response.data.app_store,
          play_store: response.data.play_store,
        });
        setTimeLeft(300);
        toast({
          title: "ABA PayWay ready",
          description: "Scan the QR with ABA Mobile or open the deep link on your phone.",
        });
      } else {
        throw new Error(response.data.description || "Failed to generate QR code");
      }
    } catch (error) {
      console.error("ABA payment initiation error:", error);
      let errorMessage =
        "There was an error starting the ABA payment process. Please try again.";

      if (axios.isAxiosError(error) && error.response) {
        errorMessage = `Error: ${error.response.data.error || error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Payment initiation failed",
        description: errorMessage,
        variant: "destructive",
      });
      setActiveMethod("overview");
    } finally {
      setIsLoadingABA(false);
    }
  };

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: `${label} copied`,
        description: `${label} is ready to paste.`,
      });
    } catch {
      toast({
        title: "Copy failed",
        description: `Could not copy ${label.toLowerCase()}.`,
        variant: "destructive",
      });
    }
  };

  const handleOpenABAMobile = () => {
    if (!paywayData?.abapay_deeplink) {
      toast({
        title: "ABA link unavailable",
        description: "The ABA Mobile deep link is missing from the payment response.",
        variant: "destructive",
      });
      return;
    }

    if (!isMobileDevice) {
      toast({
        title: "Use mobile for ABA app",
        description: "Open ABA Mobile from your phone, or scan the KHQR with the ABA app.",
      });
      return;
    }

    const fallbackUrl = /iPhone|iPad|iPod/i.test(window.navigator.userAgent)
      ? paywayData.app_store
      : paywayData.play_store;

    if (fallbackUrl) {
      window.setTimeout(() => {
        document.visibilityState === "visible" && (window.location.href = fallbackUrl);
      }, 1800);
    }

    window.location.href = paywayData.abapay_deeplink;
  };

  const handleDownloadReceipt = () => {
    if (!receiptData) {
      return;
    }

    const receiptHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booking Receipt ${receiptData.id}</title>
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
    <div class="muted">Payment Receipt</div>
    <h1>${receiptData.guidePost.title}</h1>
    <p>${receiptData.guidePost.location}</p>
    <div class="section">
      <h2>Booking</h2>
      <div class="row"><span>Receipt ID</span><strong>${receiptData.id}</strong></div>
      <div class="row"><span>Guide</span><strong>${receiptData.guidePost.guideName}</strong></div>
      <div class="row"><span>Trip Type</span><strong>${receiptData.guidePost.type}</strong></div>
      <div class="row"><span>Travel Date</span><strong>${formatDateTime(receiptData.date)}</strong></div>
      <div class="row"><span>Guests</span><strong>${receiptData.adultCount}</strong></div>
      <div class="row"><span>Booked On</span><strong>${formatDateTime(receiptData.createdAt)}</strong></div>
      <div class="row"><span>Status</span><strong>${receiptData.status}</strong></div>
    </div>
    <div class="section">
      <h2>Payment</h2>
      <div class="row"><span>Guide Amount</span><strong>$${(receiptData.totalPrice - receiptData.feeAmount).toFixed(2)}</strong></div>
      <div class="row"><span>Platform Fee</span><strong>$${receiptData.feeAmount.toFixed(2)}</strong></div>
      <div class="row"><span>Total Paid</span><strong>$${receiptData.totalPrice.toFixed(2)}</strong></div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `booking-receipt-${receiptData.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!orderId || !bookingId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f3]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#A18167]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(161,129,103,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(10,92,124,0.1),_transparent_26%),linear-gradient(180deg,_#f8f6f2_0%,_#ffffff_46%,_#f6fafb_100%)] px-4 pb-8 pt-28 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="rounded-full px-0 text-slate-600 hover:bg-transparent hover:text-[#2f251d]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfd6] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A18167] shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Secure Checkout
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.82fr,1.18fr]">
          <section className="space-y-6">
            <Card className="overflow-hidden rounded-[2rem] border-[#eadfd6] shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-3xl font-semibold tracking-tight text-[#2f251d]">
                  Complete payment
                </CardTitle>
                <CardDescription className="max-w-md text-sm leading-6 text-slate-600">
                  Minimal secure checkout with PayPal or ABA PayWay.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#eadfd6] bg-[#fffaf6] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Booking ID</p>
                    <p className="mt-2 font-mono text-sm font-semibold text-[#2f251d]">
                      {maskValue(bookingId, 8)}
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-3 h-auto px-0 text-xs text-[#A18167] hover:bg-transparent hover:text-[#2f251d]"
                      onClick={() => copyValue(bookingId, "Booking ID")}
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy booking ID
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-[#eadfd6] bg-[#fffaf6] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">PayPal Order</p>
                    <p className="mt-2 font-mono text-sm font-semibold text-[#2f251d]">
                      {maskValue(orderId, 8)}
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-3 h-auto px-0 text-xs text-[#A18167] hover:bg-transparent hover:text-[#2f251d]"
                      onClick={() => copyValue(orderId, "Order ID")}
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy order ID
                    </Button>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#eadfd6] bg-[#2f251d] p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">Checkout status</p>
                  <p className="mt-3 text-3xl font-semibold">{checkoutAmount}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-white/75">
                    <ShieldCheck className="h-4 w-4" />
                    Encrypted payment flow
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-[#eadfd6] shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#2f251d]">Payment methods</CardTitle>
                  <CardDescription>Select a single payment method to continue.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  type="button"
                  onClick={handleABAPayment}
                  className={`w-full rounded-[1.5rem] border p-5 text-left transition-all ${
                    activeMethod === "aba"
                      ? "border-[#0a5c7c] bg-[#0a5c7c] text-white shadow-[0_18px_40px_rgba(10,92,124,0.18)]"
                      : "border-[#dce8ed] bg-white hover:border-[#9ac0cf] hover:bg-[#f7fbfd]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                        <QrCode className="h-3.5 w-3.5" />
                        ABA PayWay
                      </div>
                      <h3 className="text-xl font-semibold">Pay with ABA Mobile QR</h3>
                      <p className={`max-w-md text-sm leading-6 ${activeMethod === "aba" ? "text-white/80" : "text-slate-600"}`}>
                        Best for local checkout. Scan the KHQR with ABA Mobile or continue on your phone using the deep link.
                      </p>
                    </div>
                    <div className={`rounded-2xl p-3 ${activeMethod === "aba" ? "bg-white/10" : "bg-[#eff7fa] text-[#0a5c7c]"}`}>
                      <Smartphone className="h-6 w-6" />
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod("paypal")}
                  className={`w-full rounded-[1.5rem] border p-5 text-left transition-all ${
                    activeMethod === "paypal"
                      ? "border-[#d5b66a] bg-[#f9f4df] shadow-[0_18px_40px_rgba(186,149,41,0.16)]"
                      : "border-[#eadfd6] bg-white hover:border-[#d7c0af] hover:bg-[#fffaf6]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#20344a] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                        <CreditCard className="h-3.5 w-3.5" />
                        PayPal
                      </div>
                      <h3 className="text-xl font-semibold text-[#2f251d]">Pay with PayPal</h3>
                      <p className="max-w-md text-sm leading-6 text-slate-600">
                        Flexible international checkout with PayPal balance, linked cards, and secure approval flow.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#fff7da] p-3 text-[#8c6a00]">
                      <Banknote className="h-6 w-6" />
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </section>

          <section>
            {paywayData ? (
              <Card className="overflow-hidden rounded-[2rem] border-[#c9dfe8] shadow-[0_20px_60px_rgba(10,92,124,0.12)]">
                <CardHeader className="border-b border-[#dcebf2] bg-[linear-gradient(180deg,_#ffffff_0%,_#f5fbfd_100%)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#eef8fc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#0a5c7c]">
                        <QrCode className="h-3.5 w-3.5" />
                        ABA PAYWAY
                      </div>
                      <CardTitle className="mt-4 text-2xl text-[#2f251d]">
                        Official KHQR Payment
                      </CardTitle>
                      <CardDescription className="mt-2 max-w-xl text-slate-600">
                        Scan the official KHQR or open ABA Mobile on your phone.
                      </CardDescription>
                    </div>
                    <div className="rounded-2xl border border-[#d7ebf1] bg-white px-4 py-3 text-right shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Amount due</p>
                      <p className="mt-1 text-2xl font-semibold text-[#0a5c7c]">
                        ${paywayData.amount}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 bg-[linear-gradient(180deg,_#f7fbfd_0%,_#ffffff_72%)] p-6">
                  <div className="grid gap-6 lg:grid-cols-[0.92fr,1.08fr]">
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-[1.75rem] border border-[#d7ebf1] bg-white shadow-sm">
                        <div className="bg-[linear-gradient(135deg,_#8f1f24_0%,_#ba2a31_100%)] px-5 py-4 text-white">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                                Official KHQR
                              </p>
                              <p className="mt-1 text-xl font-semibold">ABA PayWay</p>
                            </div>
                            <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-right text-sm font-semibold">
                              ABA BANK
                              <div className="text-[10px] font-medium text-white/70">KHQR</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4 bg-[#fffdfb] p-5">
                          <div className="rounded-2xl bg-[#fff3f1] px-4 py-3 text-center text-sm font-medium text-[#8f1f24]">
                            Scan this KHQR with ABA Mobile or any KHQR-supported banking app
                          </div>
                          <div className="rounded-[1.5rem] border border-[#f0e4dc] bg-white p-4">
                            <img
                              src={paywayData.qrImage}
                              alt="Official ABA KHQR payment code"
                              className={`mx-auto w-full max-w-[21rem] object-contain transition-all duration-300 ${
                                timeLeft !== null && timeLeft <= 0 ? "opacity-35 grayscale" : "opacity-100"
                              }`}
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-[#faf3ee] p-4">
                              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Channel</p>
                              <p className="mt-2 font-semibold text-[#8f1f24]">ABA Mobile KHQR</p>
                            </div>
                            <div className="rounded-2xl bg-[#faf3ee] p-4">
                              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Use</p>
                              <p className="mt-2 font-semibold text-[#2f251d]">Scan and pay in ABA app</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#d7ebf1] bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Amount</p>
                          <p className="mt-2 text-2xl font-semibold text-[#0a5c7c]">
                            ${paywayData.amount}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[#d7ebf1] bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Transaction</p>
                          <p className="mt-2 font-mono text-sm font-semibold text-[#2f251d]">
                            {maskValue(paywayData.tran_id || "N/A", 8)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-[1.75rem] border border-[#d7ebf1] bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-[#eef8fc] p-3 text-[#0a5c7c]">
                            <Clock3 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">QR status</p>
                            <p className={`mt-1 text-lg font-semibold ${timeLeft !== null && timeLeft > 0 ? "text-[#2f251d]" : "text-rose-600"}`}>
                              {timeLeft !== null && timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "QR expired"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              timeLeft !== null && timeLeft > 0 ? "bg-[#0a5c7c]" : "bg-rose-500"
                            }`}
                            style={{ width: `${((timeLeft ?? 0) / 300) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] border border-[#d7ebf1] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#2f251d]">Payment details</p>
                          <span className="rounded-full bg-[#eef8fc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#0a5c7c]">
                            Live QR
                          </span>
                        </div>
                        <div className="mb-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-[#f8fbfc] p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Transaction ID</p>
                            <p className="mt-2 font-mono text-sm font-semibold text-[#2f251d]">
                              {maskValue(paywayData.tran_id || "N/A", 8)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-[#f8fbfc] p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Payment method</p>
                            <p className="mt-2 text-sm font-semibold text-[#2f251d]">ABA PayWay QR</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-[#2f251d]">How to pay</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <div className="flex gap-3">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#eef8fc] font-semibold text-[#0a5c7c]">1</span>
                            <p>Open the ABA Mobile app and use the scan feature.</p>
                          </div>
                          <div className="flex gap-3">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#eef8fc] font-semibold text-[#0a5c7c]">2</span>
                            <p>Scan the KHQR code and confirm the amount shown in the app.</p>
                          </div>
                          <div className="flex gap-3">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#eef8fc] font-semibold text-[#0a5c7c]">3</span>
                            <p>Return here and wait for automatic confirmation after successful payment.</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                          onClick={handleOpenABAMobile}
                          className="h-12 flex-1 rounded-2xl bg-[#0a5c7c] text-white hover:bg-[#0c6b8f]"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open ABA Mobile
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleABAPayment}
                          className="h-12 flex-1 rounded-2xl border-[#d7ebf1] hover:bg-[#f3fafc]"
                        >
                          Reload QR
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setPaywayData(null);
                          setTimeLeft(null);
                          setActiveMethod("overview");
                        }}
                        className="w-full rounded-2xl text-slate-500 hover:bg-[#f3fafc] hover:text-[#0a5c7c]"
                      >
                        Change payment method
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden rounded-[2rem] border-[#eadfd6] shadow-sm">
                <CardHeader className="bg-[linear-gradient(135deg,_#fffaf6_0%,_#ffffff_55%,_#f0f7fb_100%)]">
                  <CardTitle className="text-2xl text-[#2f251d]">Choose your payment channel</CardTitle>
                  <CardDescription>
                    Choose one method and complete the payment in a single step.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="rounded-[1.75rem] border border-[#dce8ed] bg-[linear-gradient(135deg,_#0a5c7c_0%,_#0f789c_100%)] p-6 text-white shadow-[0_18px_40px_rgba(10,92,124,0.14)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/65">Local payment</p>
                        <h3 className="text-2xl font-semibold">ABA Bank KHQR checkout</h3>
                        <p className="max-w-xl text-sm leading-6 text-white/80">
                          Fast local payment through ABA PayWay. Ideal for QR-based checkout on mobile and in Cambodia.
                        </p>
                      </div>
                      <Button
                        onClick={handleABAPayment}
                        disabled={isLoadingABA}
                        className="h-12 rounded-2xl bg-white px-6 text-[#0a5c7c] hover:bg-[#eef8fc]"
                      >
                        {isLoadingABA ? "Preparing ABA checkout..." : "Pay with ABA"}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[#eadfd6] bg-white p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-2xl bg-[#fff2cf] p-3 text-[#8c6a00]">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2f251d]">PayPal secure checkout</p>
                        <p className="text-sm text-slate-500">
                          Continue with your PayPal wallet or linked cards.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.25rem] border border-[#f2ead0] bg-[#fffdf6] p-3">
                      <PayPalScriptProvider
                        options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}
                      >
                        <PayPalButtons
                          style={{
                            layout: "vertical",
                            color: "gold",
                            shape: "pill",
                            label: "paypal",
                            height: 52,
                          }}
                          createOrder={() => Promise.resolve(orderId)}
                          onClick={() => setActiveMethod("paypal")}
                          onApprove={async () => {
                            await handlePaymentSuccess("paypal");
                          }}
                        />
                      </PayPalScriptProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        {isConfirmingPayment && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
            <div className="rounded-[1.75rem] border border-white/50 bg-white px-8 py-10 text-center shadow-2xl">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#A18167]" />
              <p className="mt-4 text-lg font-semibold text-[#2f251d]">Confirming your payment</p>
              <p className="mt-2 text-sm text-slate-500">We are preparing your booking receipt.</p>
            </div>
          </div>
        )}

        {showReceipt && receiptData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-white shadow-2xl">
              <div className="border-b border-[#f0e7df] bg-[linear-gradient(180deg,_#f8fcf8_0%,_#ffffff_100%)] px-6 py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Payment Successful
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-[#2f251d]">Booking receipt</h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Your payment is confirmed and the booking has been reserved.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total paid</p>
                    <p className="mt-2 text-3xl font-semibold text-[#2f251d]">
                      ${receiptData.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#eadfd6] bg-[#fffaf6] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Trip</p>
                    <p className="mt-2 text-lg font-semibold text-[#2f251d]">{receiptData.guidePost.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{receiptData.guidePost.location}</p>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-[#eadfd6] bg-white p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Receipt ID</span>
                      <span className="font-mono text-[#2f251d]">{maskValue(receiptData.id, 10)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Guide</span>
                      <span className="font-medium text-[#2f251d]">{receiptData.guidePost.guideName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Travel date</span>
                      <span className="font-medium text-[#2f251d]">{formatDateTime(receiptData.date)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Guests</span>
                      <span className="font-medium text-[#2f251d]">{receiptData.adultCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Booked on</span>
                      <span className="font-medium text-[#2f251d]">{formatDateTime(receiptData.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3 rounded-2xl border border-[#eadfd6] bg-white p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Trip type</span>
                      <span className="font-medium text-[#2f251d]">{receiptData.guidePost.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <span className="font-medium text-emerald-700">{receiptData.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Guide amount</span>
                      <span className="font-medium text-[#2f251d]">
                        ${(receiptData.totalPrice - receiptData.feeAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Platform fee</span>
                      <span className="font-medium text-[#2f251d]">${receiptData.feeAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#f0e7df] pt-3 text-sm">
                      <span className="font-medium text-[#2f251d]">Total paid</span>
                      <span className="text-lg font-semibold text-[#2f251d]">${receiptData.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#f8fafb] p-4 text-sm text-slate-600">
                    This receipt confirms successful payment and booking reservation for the selected trip.
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#f0e7df] px-6 py-5 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleDownloadReceipt}
                  className="rounded-full border-[#d7c0af] hover:bg-[#fffaf6]"
                >
                  Download receipt
                </Button>
                <Button
                  onClick={() => router.push(`/booking-success?bookingId=${bookingId}`)}
                  className="rounded-full bg-[#2f251d] text-white hover:bg-[#1f1812]"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
