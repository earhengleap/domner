// components/BookingCart.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BookingCartProps {
  bookingDetails: {
    guidePostId: string;
    date: string;
    adultCount: number;
  };
  guidePost: {
    title: string;
    price: number;
    rating?: number;
    ratingCount?: number;
    imageUrl?: string;
  };
}

const BookingCart: React.FC<BookingCartProps> = ({
  bookingDetails,
  guidePost,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [adminFee, setAdminFee] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          window.location.href = `/${bookingDetails.guidePostId}`; // Redirect to detail page
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Calculate admin fee (10% of subtotal)
    const subtotal = guidePost.price * bookingDetails.adultCount;
    const calculatedAdminFee = subtotal * 0.1;
    setAdminFee(calculatedAdminFee);

    return () => clearInterval(timer);
  }, [bookingDetails.guidePostId, guidePost.price, bookingDetails.adultCount]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-booking-and-paypal-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingDetails,
          adminFee: adminFee,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      const data = await response.json();
      if (data.paypalOrderId && data.bookingId) {
        window.location.href = `/payment?orderId=${data.paypalOrderId}&bookingId=${data.bookingId}`;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("An error occurred during checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const subtotal = guidePost.price * bookingDetails.adultCount;

  return (
    <div className="max-w-6xl mx-auto p-4 py-36">
      <h1 className="text-3xl font-bold mb-6">Booking cart</h1>
      <div className="bg-red-100 p-3 rounded-md mb-6 flex items-center">
        <span className="mr-2">⏰</span>
        <p>We'll hold your spot for {formatTime(timeLeft)} minutes.</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow">
          <h2 className="text-xl font-semibold mb-4">
            {formatDate(bookingDetails.date)}
          </h2>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row">
                {guidePost.imageUrl && (
                  <img
                    src={guidePost.imageUrl}
                    alt={guidePost.title}
                    className="w-48 h-36 object-cover rounded-md mr-6 mb-4 md:mb-0"
                  />
                )}
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">
                    {guidePost.title}
                  </h3>
                  {guidePost.rating !== undefined &&
                    guidePost.ratingCount !== undefined && (
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.floor(guidePost.rating!)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-1 text-sm">
                          {guidePost.rating} ({guidePost.ratingCount})
                        </span>
                      </div>
                    )}
                  <p className="text-sm mb-1">
                    {formatDate(bookingDetails.date)}
                  </p>
                  <p className="text-sm mb-1">
                    {bookingDetails.adultCount} Adult
                    {bookingDetails.adultCount > 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center mb-1">
                    <span className="mr-1">🌍</span>
                    <p className="text-sm">Language: English</p>
                  </div>
                  <p className="text-sm text-green-600 mb-4">
                    Free cancellation
                  </p>
                  <div className="flex">
                    <Button variant="outline" size="sm" className="mr-2">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                  <p className="font-bold">
                    ${subtotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:w-1/3">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Price Details</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <p>Total Price</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                All taxes and fees included
              </p>
              <Button
                onClick={handleCheckout}
                className="w-full mb-4"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Go to checkout"}
              </Button>
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <span className="mr-2">🛡️</span>
                  <div>
                    <p className="font-semibold">Pay nothing today</p>
                    <p className="text-sm text-gray-600">
                      Book now and pay later
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">⏰</span>
                  <div>
                    <p className="font-semibold">Free cancellation</p>
                    <p className="text-sm text-gray-600">
                      Until 8:15 AM on the day before your experience
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-md">
                <h4 className="font-bold mb-2">Why book with us?</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="mr-2">🛡️</span>
                    <p>Secure payment</p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">💰</span>
                    <p>No hidden costs</p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">💬</span>
                    <p>24/7 customer support worldwide</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingCart;