// components/PayPalPayment.tsx

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalPaymentProps {
  bookingId: string;
  amount: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export default function PayPalPayment({ bookingId, amount, onSuccess, onError }: PayPalPaymentProps) {
  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
      <PayPalButtons
        createOrder={async () => {
          try {
            const response = await fetch('/api/create-paypal-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ bookingId, amount }),
            });
            const order = await response.json();
            return order.id;
          } catch (error) {
            onError(error as Error);
            return '';
          }
        }}
        onApprove={async (data) => {
          try {
            const response = await fetch('/api/capture-paypal-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId: data.orderID, bookingId }),
            });
            const captureData = await response.json();
            if (captureData.status === 'COMPLETED') {
              onSuccess();
            }
          } catch (error) {
            onError(error as Error);
          }
        }}
      />
    </PayPalScriptProvider>
  );
}