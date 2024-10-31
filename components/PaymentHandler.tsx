// components/PaymentHandler.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";

interface PaymentHandlerProps {
  bookingId: string;
  amount: number;
  currency?: string;
}

export default function PaymentHandler({ bookingId, amount, currency = 'USD' }: PaymentHandlerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePaymentSuccess = async (data: any) => {
    setIsProcessing(true);
    try {
      const response = await axios.post('/api/capture-paypal-payment', {
        orderId: data.orderID,
        bookingId: bookingId,
      });

      if (response.data.status === 'success') {
        router.push(response.data.redirectUrl);
      } else {
        throw new Error(response.data.message || 'Payment capture failed');
      }
    } catch (error) {
      console.error('Error in payment process:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {isProcessing ? (
        <p className="text-center">Processing your payment...</p>
      ) : (
        <PayPalButtons
          createOrder={(data, actions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: currency,
                    value: amount.toFixed(2),
                  },
                },
              ],
            });
          }}
          onApprove={handlePaymentSuccess}
          onError={(err) => {
            console.error('PayPal error:', err);
            toast({
              title: "Payment Error",
              description: "There was an error with PayPal. Please try again.",
              variant: "destructive",
            });
          }}
        />
      )}
    </div>
  );
}