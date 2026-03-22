"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paywayData, setPaywayData] = useState<{
    qrImage: string;
    qrString: string;
    abapay_deeplink: string;
    amount: string;
    tran_id?: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    setOrderId(searchParams.get("orderId"));
    setBookingId(searchParams.get("bookingId"));
  }, [searchParams]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!paywayData?.tran_id || isPaid) return;

    console.log("[ABA_PAYWAY_POLL] Starting status polling for:", paywayData.tran_id);

    const pollStatus = async () => {
      try {
        const response = await axios.post(
          "/api/create-booking-and-paypal-order/check-transaction-payway",
          { tran_id: paywayData.tran_id }
        );

        console.log("[ABA_PAYWAY_POLL] Response:", response.data);

        const paymentStatusCode = response.data?.data?.payment_status_code;
        if (paymentStatusCode === 0 || paymentStatusCode === "0") {
          console.log("[ABA_PAYWAY_POLL] Success detected! Redirecting...");
          setIsPaid(true);
          await handlePaymentSuccess("aba");
        }
      } catch (error) {
        console.error("[ABA_PAYWAY_POLL] Error:", error);
      }
    };

    const interval = setInterval(pollStatus, 5000);

    return () => {
      console.log("[ABA_PAYWAY_POLL] Stopping polling");
      clearInterval(interval);
    };
  }, [paywayData?.tran_id, isPaid]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePaymentSuccess = async (method: "paypal" | "aba" = "paypal") => {
    try {
      console.log(`Payment successful via ${method}`);
      const endpoint = method === "aba" 
        ? "/api/confirm-aba-payment" 
        : "/api/capture-paypal-payment";

      const response = await axios.post(endpoint, { orderId, bookingId });
      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed!",
      });
      
      if (response.data.redirectUrl) {
        router.push(response.data.redirectUrl);
      } else {
        router.push(`/booking-success?bookingId=${bookingId}`);
      }
    } catch (error) {
      console.error(`${method} payment capture error:`, error);
      toast({
        title: "Payment Failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
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

    setIsLoading(true);
    setPaywayData(null);
    setTimeLeft(null);
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
          tran_id: response.data.status?.tran_id
        });
        setTimeLeft(300); // 5 minutes timeout
        toast({
          title: "Scan to Pay",
          description: "Please scan the QR code with your ABA Mobile app.",
        });
      } else {
        throw new Error(response.data.description || "Failed to generate QR code");
      }
    } catch (error) {
      console.error("ABA payment initiation error:", error);
      let errorMessage = "There was an error starting the ABA payment process. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = `Error: ${error.response.data.error || error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Payment Initiation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!orderId || !bookingId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0a5c7c]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0a5c7c]/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-md w-full relative z-10 transition-all duration-500">
        <div className="p-8 md:p-10">
          <header className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
              Complete Payment
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
              Secure checkout for your booking
            </p>
          </header>

          <div className="space-y-8">
            {paywayData ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center">
                {/* Compact Amount Display */}
                <div className="text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Payment Amount</p>
                   <p className="text-3xl font-black text-[#0a5c7c] tracking-tight">${paywayData.amount}</p>
                </div>

                {/* Integrated QR Image without white background container */}
                <div className="relative group p-1 transition-all duration-500">
                  {timeLeft === 0 && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-xl flex flex-col items-center justify-center z-10 transition-all duration-300">
                      <p className="text-red-600 font-black text-xs mb-3 text-center">EXPIRED</p>
                      <Button 
                        size="sm"
                        onClick={handleABAPayment}
                        className="bg-[#0a5c7c] text-white rounded-xl font-bold h-9 px-4 text-xs"
                      >
                        RELOAD
                      </Button>
                    </div>
                  )}
                  
                  <div className="relative rounded-xl overflow-hidden flex items-center justify-center">
                    <img
                      src={paywayData.qrImage}
                      alt="ABA QR Code"
                      className={`w-[240px] h-auto object-contain transition-all ${timeLeft === 0 ? 'opacity-20 grayscale blur-md' : 'opacity-100'}`}
                    />
                  </div>
                </div>

                {timeLeft !== null && timeLeft > 0 && (
                  <div className="flex items-center justify-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black transition-all">
                    <div className={`w-1.5 h-1.5 rounded-full ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className={timeLeft < 60 ? 'text-red-500' : 'text-slate-400'}>
                      EXPIRES IN {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
                
                <div className="text-center px-6">
                  <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
                    Scan with <span className="text-slate-700 font-bold">ABA Mobile</span> to pay
                  </p>
                </div>
                
                <div className="w-full pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPaywayData(null);
                      setTimeLeft(null);
                    }}
                    className="w-full h-10 text-slate-300 hover:text-slate-500 font-bold text-[11px] tracking-widest uppercase rounded-xl"
                  >
                    Change Method
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <Button
                  onClick={handleABAPayment}
                  className="w-full h-16 bg-[#0a5c7c] hover:bg-[#0c6b8f] text-white rounded-[1.25rem] font-black text-lg shadow-xl shadow-[#0a5c7c]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span className="tracking-tight">Initializing...</span>
                    </div>
                  ) : (
                    <span className="tracking-tight">PAY WITH ABA PAY</span>
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="px-4 bg-white text-slate-300">or checkout with</span>
                  </div>
                </div>

                <div className="rounded-[1.25rem] overflow-hidden bg-slate-50/50 p-1 border border-slate-50">
                  <PayPalScriptProvider
                    options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}
                  >
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "paypal",
                        height: 55,
                      }}
                      createOrder={() => Promise.resolve(orderId)}
                      onApprove={async (data, actions) => {
                        await handlePaymentSuccess("paypal");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>

                <p className="text-[10px] text-center text-slate-300 font-bold uppercase tracking-widest pt-2">
                  Transaction secured by PayPal & ABA
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}