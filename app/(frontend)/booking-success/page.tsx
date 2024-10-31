// app/booking-success/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface BookingDetails {
  id: string;
  date: string;
  adultCount: number;
  status: string;
  guidePost: {
    title: string;
  };
}

export default function BookingSuccessPage() {
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

    fetchBookingDetails();
  }, [bookingId, toast]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 text-xl mb-4">Booking information unavailable</p>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-green-600">
            Booking Successful!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Booking ID:</strong> {booking.id}</p>
            <p><strong>Trip:</strong> {booking.guidePost.title}</p>
            <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Number of Adults:</strong> {booking.adultCount}</p>
            <p><strong>Status:</strong> {booking.status}</p>
          </div>
          <div className="mt-6 text-center">
            <p className="mb-4">
              Thank you for your booking! We've sent a confirmation email with
              more details.
            </p>
            <Button onClick={() => router.push("/")}>
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}