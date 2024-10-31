"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setOrderId(searchParams.get("orderId"));
    setBookingId(searchParams.get("bookingId"));
  }, [searchParams]);

  const handlePaymentSuccess = async () => {
    try {
      console.log("Payment successful");
      await axios.post("/api/capture-paypal-payment", { orderId, bookingId });
      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed!",
      });
      router.push("/booking-success");
    } catch (error) {
      console.error("Payment capture error:", error);
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
    try {
      const response = await axios.post(
        "/api/create-booking-and-paypal-order/check-out-payway",
        { bookingId }
      );
      
      const {
        req_time,
        merchant_id,
        tran_id,
        amount,
        items,
        firstname,
        lastname,
        email,
        phone,
        type,
        currency,
        payment_option,
        return_url,
        cancel_url,
        continue_success_url,
        return_params,
        hash,
        url
      } = response.data;

      // Create a form and submit it to ABA PayWay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      
      const formData = {
        req_time,
        merchant_id,
        tran_id,
        amount,
        items,
        firstname,
        lastname,
        email,
        phone,
        type,
        currency,
        payment_option,
        return_url,
        cancel_url,
        continue_success_url,
        return_params,
        hash
      };

      for (const [key, value] of Object.entries(formData)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("ABA payment initiation error:", error);
      let errorMessage = "There was an error starting the ABA payment process. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = `Error: ${error.response.data.error || error.message}`;
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
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-4">Complete Your Payment</h1>

      <div className="space-y-4">
        <Button
          onClick={handleABAPayment}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Pay with ABA"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <PayPalScriptProvider
          options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}
        >
          <PayPalButtons
            createOrder={() => Promise.resolve(orderId)}
            onApprove={async (data, actions) => {
              await handlePaymentSuccess();
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
}