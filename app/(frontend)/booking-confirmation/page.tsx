"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import PayPalPayment from '@/components/PayPalPayment';

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [error, setError] = useState('');

  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setBookingDetails(data);
        } else {
          setError('Failed to fetch booking details');
        }
      } catch (error) {
        setError('An error occurred while fetching booking details');
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handlePaymentSuccess = () => {
    router.push('/booking-success');
  };

  const handlePaymentError = (error: Error) => {
    setError(`Payment failed: ${error.message}`);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!bookingDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Confirm Your Booking</h1>
      <div className="mb-4">
        <p>Booking ID: {bookingDetails.id}</p>
        <p>Date: <span suppressHydrationWarning>{new Date(bookingDetails.date).toLocaleDateString()}</span></p>
        <p>Adults: {bookingDetails.adultCount}</p>
        <p>Total Amount: ${bookingDetails.totalAmount}</p>
      </div>
      <PayPalPayment
        bookingId={bookingDetails.id}
        amount={bookingDetails.totalAmount.toString()}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingConfirmationContent />
    </Suspense>
  );
}