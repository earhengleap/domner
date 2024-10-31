'use client'

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import { format, parse, isValid } from "date-fns";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Shadcn UI components
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { PlusIcon, MinusIcon, User, Mail, Facebook, Send, Twitter } from "lucide-react";

import ReviewCarousel from "@/components/Review";
import { AiFillTikTok } from "react-icons/ai";

const BookingCart = dynamic(() => import("@/components/BookingCart"), {
  ssr: false,
});

// Types
interface GuidePost {
  id: string;
  title: string;
  location: string;
  area: string;
  type: string;
  about: string;
  packageOffer: string;
  highlight: string;
  fullDescription: string;
  include: string;
  notSuitableFor: string;
  importantInfo: string;
  price: number;
  photos: string[];
  offlineMapUrl: string | null;
  bookletUrl: string | null;
  termsUrl: string | null;
  itinerary: { title: string; content: string }[];
  user: {
    id: string;
    name: string;
    hostName?: string;
    avatarUrl: string | null;
    guideProfile: {
      firstName: string;
      lastName: string;
      description: string;
      email: string;
      facebookLink: string;
      telegramLink: string;
      tiktokLink: string;
      twitterLink: string;
    } | null;
  };
}

interface ReviewType {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface PageProps {
  params: {
    guidePostId: string;
  };
}

const GuidePostPage = ({ params }: PageProps) => {
  const [guidePost, setGuidePost] = useState<GuidePost | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [showBookingCart, setShowBookingCart] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const fetchGuidePost = async () => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setError("You must be logged in to view this page");
      setLoading(false);
      return;
    }

    try {
      const [postResponse, availabilityResponse, reviewsResponse] =
        await Promise.all([
          axios.get(`/api/guide-posts/${params.guidePostId}`),
          axios.get(`/api/posts/${params.guidePostId}/availability`),
          axios.get(`/api/posts/${params.guidePostId}/reviews`),
        ]);

      setGuidePost(postResponse.data);
      setReviews(reviewsResponse.data);

      // Convert availability strings to Date objects
      const availableDates = availabilityResponse.data.availability
        .map((dateString: string) =>
          parse(dateString, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date())
        )
        .filter((date: Date) => isValid(date));

      setAvailability(availableDates);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching guide post, availability, or reviews:", err);
      setError(err.response?.data?.message || "Failed to load guide post data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidePost();
  }, [params.guidePostId, status]);

  const isDateAvailable = (date: Date) => {
    return availability.some(
      (availableDate) => availableDate.toDateString() === date.toDateString()
    );
  };

  const handleAdultIncrement = () => {
    setAdultCount((prev) => prev + 1);
  };

  const handleAdultDecrement = () => {
    setAdultCount((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleBooking = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to book a trip",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Date selection required",
        description: "Please select a date for your booking",
        variant: "destructive",
      });
      return;
    }

    setShowBookingCart(true);
  };

  const handleAddReview = async (content: string) => {
    try {
      const response = await fetch(`/api/posts/${params.guidePostId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews((prevReviews) => [newReview, ...prevReviews]);
        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
        });
      } else {
        throw new Error("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader" />
      </div>
    );
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!guidePost)
    return <div className="text-center">No guide post data available</div>;

  if (showBookingCart) {
    return (
      <BookingCart
        bookingDetails={{
          guidePostId: guidePost.id,
          date: format(selectedDate!, "yyyy-MM-dd"),
          adultCount: adultCount,
        }}
        guidePost={{
          title: guidePost.title,
          price: guidePost.price,
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 py-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{guidePost.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {guidePost.photos.slice(0, 5).map((photo, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden rounded-lg
              ${
                index === 0
                  ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-[1]"
                  : "aspect-square"
              }
              transition-transform duration-300 ease-in-out hover:scale-105
            `}
          >
            <Image
              src={photo}
              alt={`Trip image ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        ))}
      </div>

      <p className="text-xl mb-2 font-bold">{guidePost.location}</p>
      <Button variant="outline" className="rounded-full">
        {guidePost.type}
      </Button>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-36">
        <div className="md:col-span-2">
          <p>Area: {guidePost.area}</p>
          <p className="text-gray-600">Check availability to see start time</p>

          <h2 className="text-xl font-bold mt-6 mb-2">Experience</h2>
          <h3 className="text-2xl font-bold mb-4">Itinerary</h3>
          <div className="container mx-auto px-2">
            <div className="relative">
              {guidePost.itinerary.map((item, index) => (
                <div key={index} className="mb-8 flex">
                  <div className="flex flex-col items-center mr-4 mt-1">
                    <div className="w-4 h-4 bg-green-600 rounded-full relative z-10"></div>
                    {index < guidePost.itinerary.length - 1 && (
                      <div className="w-1 bg-gray-300 absolute top-1 bottom-10"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card className="md:sticky lg:w-80 md:top-4 h-fit">
          <CardHeader>
            <CardTitle>Select a date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-y-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || !isDateAvailable(date)}
                modifiers={{
                  available: (date) => isDateAvailable(date),
                }}
                modifiersStyles={{
                  available: { backgroundColor: "#e6ffe6" },
                  selected: {
                    backgroundColor: "#014d01",
                    color: "green",
                    fontWeight: "bold",
                  },
                }}
                className="rounded-md border items-center justify-center"
              />
            </div>
            {selectedDate && (
              <p className="text-green-500 mt-2">
                Selected date: {format(selectedDate, "MMMM d, yyyy")}
              </p>
            )}
            <div className="mt-4">
              <Label>Number of Guest</Label>
              <div className="flex items-center mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAdultDecrement}
                  disabled={adultCount <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="mx-4 text-lg font-semibold">{adultCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAdultIncrement}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
                <div className="ml-4">
                  (<User size={16} className="inline mx-1" /> Guest x
                  {adultCount})
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={guidePost.user.avatarUrl || undefined}
                    alt={guidePost.user.hostName || guidePost.user.name}
                  />
                  <AvatarFallback>
                    {guidePost.user.hostName?.[0] || guidePost.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-bold">
                    Hosted by: {guidePost.user.hostName || guidePost.user.name}
                  </p>
                </div>
              </div>
              {guidePost.user.guideProfile && (
                <>
                  <p className="mt-2 text-sm text-gray-600">
                    {guidePost.user.guideProfile.description || "No description available"}
                  </p>
                  <div className="space-y-2 mt-4">
                    {guidePost.user.guideProfile.email && (
                      <a href={`mailto:${guidePost.user.guideProfile.email}`} className="flex items-center text-gray-600 hover:text-blue-500">
                        <Mail size={20} className="mr-2" />
                        <span className="text-sm">{guidePost.user.guideProfile.email}</span>
                      </a>
                    )}
                    {guidePost.user.guideProfile.facebookLink && (
                      <a href={guidePost.user.guideProfile.facebookLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-blue-500">
                        <Facebook size={20} className="mr-2" />
                        <span className="text-sm">Facebook Profile</span>
                      </a>
                    )}
                    {guidePost.user.guideProfile.telegramLink && (
                      <a href={guidePost.user.guideProfile.telegramLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-blue-500">
                        <Send size={20} className="mr-2" />
                        <span className="text-sm">Telegram</span>
                      </a>
                    )}
                    {guidePost.user.guideProfile.tiktokLink && (
                      <a href={guidePost.user.guideProfile.tiktokLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-blue-500">
                        <AiFillTikTok size={20} className="mr-2" />
                        <span className="text-sm">TikTok</span>
                      </a>
                    )}
                    {guidePost.user.guideProfile.twitterLink && (
                      <a href={guidePost.user.guideProfile.twitterLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-blue-500">
                        <Twitter size={20} className="mr-2" />
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="border-t mt-4 pt-4">
              <p className="font-bold">
                Price: ${guidePost.price * adultCount}
              </p>
            </div>
            <Button
              onClick={handleBooking}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
              disabled={!selectedDate || bookingInProgress}
            >
              {bookingInProgress ? "Processing..." : "Go to checkout"}
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-gray-600 mt-8">
        <span className="inline-block mr-2">ⓘ</span>
        For reference only, itineraries are subject to change.
      </p>

      <hr className="my-8" />

      <div className="space-y-6">
        <section className="flex flex-col md:flex-row md:items-start">
          <h2 className="text-xl font-bold w-full md:w-56 mb-4 md:mb-0">About this experience</h2>
          <div className="flex-1 md:ml-8">
            <p>{guidePost.about}</p>
          </div>
        </section>

        <hr className="my-8" />

        <section className="flex flex-col md:flex-row md:items-start">
          <h2 className="text-xl font-bold w-full md:w-56 mb-4 md:mb-0">Package Offer</h2>
          <div className="flex-1 md:ml-8">
            <p>{guidePost.packageOffer}</p>
          </div>
        </section>

        <hr className="my-8" />

        <section className="flex flex-col md:flex-row md:items-start">
          <h2 className="text-xl font-bold w-full md:w-56 mb-4 md:mb-0">Highlight</h2>
          <div className="flex-1 md:ml-8">
            <p>{guidePost.highlight}</p>
          </div>
        </section>

        <hr className="my-8" />

        <section className="flex flex-col md:flex-row md:items-start">
          <h2 className="text-xl font-bold w-full md:w-56 mb-4 md:mb-0">Full Description</h2>
          <div className="flex-1 md:ml-8">
            <motion.div
              className="overflow-hidden relative"
              initial={false}
              animate={{ height: showFullDescription ? "auto" : "7.5em" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <p className="text-gray-700">{guidePost.fullDescription}</p>
              {!showFullDescription && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
              )}
            </motion.div>
            {guidePost.fullDescription.length > 300 && (
              <Button
                variant="ghost"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                {showFullDescription ? "Show less" : "Read more"}
              </Button>
            )}
          </div>
        </section>

        <hr className="my-8" />

        <section className="flex flex-col md:flex-row md:items-start">
          <h2 className="text-xl font-bold w-full md:w-56 mb-4 md:mb-0">What's Included</h2>
          <div className="flex-1 md:ml-8">
            <p className="text-gray-700">{guidePost.include}</p>
          </div>
        </section>

        <hr className="my-8" />

        <section className="flex flex-col md:flex-row md:items-start">
          <h2 className="text-xl font-bold w-full md:w-56 mb-4 md:mb-0">Not Suitable For</h2>
          <div className="flex-1 md:ml-8">
            <p className="text-gray-700">{guidePost.notSuitableFor}</p>
          </div>
        </section>

        <hr className="my-8" />

        <section className="flex flex-col md:flex-row md:items-start">
          <h2 className="text-xl font-bold w-full md:w-56 mb-4 md:mb-0">Important Information</h2>
          <div className="flex-1 md:ml-8">
            <p className="text-gray-700">{guidePost.importantInfo}</p>
          </div>
        </section>

        <hr className="my-8" />

        {(guidePost.offlineMapUrl || guidePost.bookletUrl || guidePost.termsUrl) && (
          <section className="flex flex-col md:flex-row md:items-start">
            <h2 className="text-xl font-bold w-full md:w-56 mb-4 md:mb-0">Downloads</h2>
            <div className="flex-1 md:ml-8 space-y-4">
              {guidePost.offlineMapUrl && (
                <a
                  href={guidePost.offlineMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-semibold">Offline Map</p>
                  <p className="text-sm text-gray-500">Download the offline map for your journey</p>
                </a>
              )}
              {guidePost.bookletUrl && (
                <a
                  href={guidePost.bookletUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-semibold">Travel Booklet</p>
                  <p className="text-sm text-gray-500">Download your comprehensive travel guide</p>
                </a>
              )}
              {guidePost.termsUrl && (
                <a
                  href={guidePost.termsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-semibold">Terms & Conditions</p>
                  <p className="text-sm text-gray-500">View our terms and conditions</p>
                </a>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="mt-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Reviews and Ratings</h2>
          <ReviewCarousel reviews={reviews} onAddReview={handleAddReview} />
        </div>
      </div>

      {/* Floating Book Now Button for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg md:hidden">
        <Button
          onClick={handleBooking}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={!selectedDate || bookingInProgress}
        >
          {bookingInProgress ? "Processing..." : `Book Now - $${guidePost.price * adultCount}`}
        </Button>
      </div>
    </div>
  );
};

export default GuidePostPage;