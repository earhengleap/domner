"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ShieldCheck, CreditCard, Wallet, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import ABAQR from "./ABAQR";

interface UnifiedCheckoutProps {
  bookingDetails: {
    guidePostId: string;
    date: string;
    adultCount: number;
  };
  guidePost: {
    title: string;
    price: number;
    imageUrl?: string;
  };
  onBack: () => void;
}

const UnifiedCheckout: React.FC<UnifiedCheckoutProps> = ({
  bookingDetails,
  guidePost,
  onBack,
}) => {
  const [step, setStep] = useState<"summary" | "payment" | "aba-qr">("summary");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paywayData, setPaywayData] = useState<any>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const subtotal = guidePost.price * bookingDetails.adultCount;
  const adminFee = subtotal * 0.1;
  const total = subtotal + adminFee;

  // Polling for ABA Payment
  useEffect(() => {
    if (!paywayData?.tran_id || step !== "aba-qr") return;

    const pollStatus = async () => {
      try {
        const response = await axios.post(
          "/api/create-booking-and-paypal-order/check-transaction-payway",
          { tran_id: paywayData.tran_id }
        );

        const paymentStatusCode = response.data?.data?.payment_status_code;
        if (paymentStatusCode === 0 || paymentStatusCode === "0") {
          toast({ title: "Payment Successful", description: "Your booking is confirmed!" });
          router.push(`/booking-success?bookingId=${bookingId}`);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [paywayData?.tran_id, step, bookingId, router, toast]);

  // Timer for QR
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => (prev ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCreateBooking = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-booking-and-paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bookingDetails, adminFee }),
      });

      if (!response.ok) throw new Error("Failed to create booking");
      const data = await response.json();
      setBookingId(data.bookingId);
      setPaypalOrderId(data.paypalOrderId);
      setStep("payment");
    } catch (err) {
      toast({ title: "Error", description: "Could not create booking. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleABAPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post("/api/create-booking-and-paypal-order/check-out-payway", { bookingId });
      if (response.data.success) {
        setPaywayData(response.data);
        setTimeLeft(300); // 5 minutes
        setStep("aba-qr");
      } else {
        throw new Error("Failed to generate QR");
      }
    } catch (err) {
      toast({ title: "ABA Error", description: "Could not initiate payment.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Aspect: Content based on Step */}
        <div className="lg:col-span-2 space-y-6">
          {step === "summary" && (
            <Card className="rounded-[2rem] border-slate-100 shadow-xl overflow-hidden">
               <div className="bg-[#0a5c7c] p-6 text-white">
                  <h3 className="text-xl font-black italic tracking-tighter">ORDER SUMMARY</h3>
               </div>
               <CardContent className="p-8 space-y-6">
                  <div className="flex gap-6">
                     {guidePost.imageUrl && (
                        <img src={guidePost.imageUrl} alt={guidePost.title} className="w-32 h-32 object-cover rounded-2xl shadow-md" />
                     )}
                     <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2 tracking-tight">{guidePost.title}</h2>
                        <div className="flex items-center gap-4 text-slate-500 text-sm font-bold uppercase tracking-widest">
                           <span>{bookingDetails.date}</span>
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                           <span>{bookingDetails.adultCount} Guest{bookingDetails.adultCount > 1 ? "s" : ""}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-50 space-y-3">
                     <div className="flex justify-between text-slate-600 font-bold">
                        <span>Original Price</span>
                        <span>${subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-slate-400 font-medium">
                        <span>Service Fee (10%)</span>
                        <span>${adminFee.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-2xl font-black text-[#0a5c7c] pt-4">
                        <span>Grand Total</span>
                        <span>${total.toFixed(2)}</span>
                     </div>
                  </div>

                  <Button 
                    onClick={handleCreateBooking} 
                    className="w-full h-16 bg-[#0a5c7c] hover:bg-[#0c6b8f] text-white rounded-2xl font-black text-xl shadow-xl shadow-[#0a5c7c]/20 transition-all hover:scale-[1.02]"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "INITIALIZING..." : "CONFIRM & GO TO PAYMENT"}
                  </Button>
               </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="grid gap-6">
                  <button
                    onClick={handleABAPayment}
                    disabled={isProcessing}
                    className="group relative w-full overflow-hidden rounded-[2rem] border-4 border-slate-100 bg-white p-8 text-left transition-all hover:border-[#0a5c7c]/30 hover:shadow-2xl hover:shadow-[#0a5c7c]/10 active:scale-[0.98]"
                  >
                     <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-6">
                          <div className="h-20 w-20 rounded-[1.5rem] bg-[#0a5c7c] flex items-center justify-center shadow-lg shadow-[#0a5c7c]/20 group-hover:scale-110 transition-transform duration-300">
                             <Wallet className="w-10 h-10 text-white" />
                          </div>
                          <div>
                            <p className="font-black text-[#0a5c7c] text-3xl leading-tight tracking-tight uppercase">ABA PayWay</p>
                            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Pay with ABA Mobile QR (Local)</p>
                          </div>
                        </div>
                        {isProcessing ? (
                          <div className="h-8 w-8 border-4 border-[#0a5c7c]/20 border-t-[#0a5c7c] animate-spin rounded-full"></div>
                        ) : (
                          <div className="h-12 w-12 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-[#0a5c7c] group-hover:text-white transition-all">
                             <ArrowLeft className="w-6 h-6 rotate-180" />
                          </div>
                        )}
                     </div>
                  </button>

                  <div className="relative py-4 flex items-center justify-center">
                    <span className="absolute w-full h-[1px] bg-slate-200"></span>
                    <span className="relative bg-[#f8fafc] px-6 text-xs font-black uppercase text-slate-300 tracking-[0.4em]">International Checkout</span>
                  </div>

                  <div className="rounded-[2rem] border-4 border-slate-100 bg-white p-8 hover:border-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-500/5 group">
                    <div className="flex items-center gap-6 mb-8">
                       <div className="h-20 w-20 rounded-[1.5rem] bg-[#003087] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                          <CreditCard className="w-10 h-10 text-white" />
                       </div>
                       <div>
                         <p className="font-black text-blue-900 text-3xl leading-tight tracking-tight uppercase">PayPal</p>
                         <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Global Credit & Debit Cards</p>
                       </div>
                    </div>
                    {paypalOrderId && (
                      <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
                        <PayPalButtons
                          style={{ layout: "vertical", color: "blue", shape: "pill", label: "paypal", height: 50 }}
                          createOrder={() => Promise.resolve(paypalOrderId)}
                          onApprove={async () => {
                          router.push(`/booking-success?bookingId=${bookingId}`);
                        }}
                        />
                      </PayPalScriptProvider>
                    )}
                  </div>
               </div>
            </div>
          )}

          {step === "aba-qr" && (
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
              <ABAQR 
                qrString={paywayData.qrString} 
                amount={total.toFixed(2)} 
                merchantName="BORPORT"
              />
              
              <div className="mt-8 flex flex-col items-center gap-4">
                 <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-slate-50">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Awaiting Scan...</span>
                    <span className="text-[#0a5c7c] font-black">{formatTime(timeLeft!)}</span>
                 </div>
                 <Button variant="ghost" onClick={() => setStep("payment")} className="text-slate-400 font-bold hover:text-slate-600">
                    Cancel & Change Method
                 </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Aspect: Trust Sidebar */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="rounded-3xl border-slate-100 bg-slate-50 p-6 space-y-6">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="text-emerald-500 w-8 h-8" />
                 <div>
                    <h4 className="font-black text-slate-800 tracking-tight">SECURE PAYMENT</h4>
                    <p className="text-xs text-slate-500 font-medium">100% Encrypted transactions</p>
                 </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-slate-200">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Why chose us?</p>
                 <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm font-bold text-slate-600">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#0a5c7c]"></span>
                       Instant Confirmation
                    </li>
                    <li className="flex items-center gap-2 text-sm font-bold text-slate-600">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#0a5c7c]"></span>
                       Free Cancellation
                    </li>
                    <li className="flex items-center gap-2 text-sm font-bold text-slate-600">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#0a5c7c]"></span>
                       Bakong Verified PayWay
                    </li>
                 </ul>
              </div>
           </Card>
           
           <div className="p-6 text-center space-y-4 opacity-50 grayscale contrast-50">
              <img src="/aba.png" alt="ABA Logo" className="h-8 mx-auto" />
              <img src="/paypal.png" alt="PayPal Logo" className="h-6 mx-auto" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedCheckout;
