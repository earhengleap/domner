'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { format, parse, isValid } from 'date-fns';

// Shadcn UI components
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

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
    } | null;
  };
}

// Detail component
const Detail: React.FC<{ guidePostId: string }> = ({ guidePostId }) => {
  const [guidePost, setGuidePost] = useState<GuidePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchGuidePost = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        setError('You must be logged in to view this page');
        setLoading(false);
        return;
      }

      try {
        const [postResponse, availabilityResponse] = await Promise.all([
          axios.get(`/api/guide-posts/${guidePostId}`),
          axios.get(`/api/posts/${guidePostId}/availability`)
        ]);

        setGuidePost(postResponse.data);
        
        // Convert availability strings to Date objects
        const availableDates = availabilityResponse.data.availability
          .map((dateString: string) => parse(dateString, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date()))
          .filter((date: Date) => isValid(date));
        
        setAvailability(availableDates);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching guide post or availability:', err);
        setError(err.response?.data?.message || 'Failed to load guide post data');
        setLoading(false);
      }
    };

    fetchGuidePost();
  }, [guidePostId, status]);

  const isDateAvailable = (date: Date) => {
    return availability.some(availableDate => 
      availableDate.toDateString() === date.toDateString()
    );
  };

  const handleBooking = async () => {
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

    setBookingInProgress(true);

    try {
      const response = await axios.post('/api/bookings', {
        guidePostId: guidePost?.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });

      if (response.status === 201) {
        toast({
          title: "Booking Successful",
          description: "Your trip has been booked successfully!",
          variant: "default",
        });
        
        // Refresh availability after successful booking
        const availabilityResponse = await axios.get(`/api/posts/${guidePostId}/availability`);
        const newAvailableDates = availabilityResponse.data.availability
          .map((dateString: string) => parse(dateString, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date()))
          .filter((date: Date) => isValid(date));
        setAvailability(newAvailableDates);
        setSelectedDate(undefined);
      }
    } catch (err) {
      console.error('Booking error:', err);
      toast({
        title: "Booking Failed",
        description: err.response?.data?.error || "An error occurred while booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!guidePost) return <div className="text-center">No guide post data available</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 font-sans py-36">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{guidePost.title}</h1>
      
      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {guidePost.photos.slice(0, 5).map((photo, index) => (
          <div 
            key={index} 
            className={`
              relative overflow-hidden rounded-lg
              ${index === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-[2/1.5]' : 'aspect-square'}
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

      <p className="text-lg mb-2">{guidePost.location}</p>
      <Button variant="outline" className="rounded-full">{guidePost.type}</Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <p>Area: {guidePost.area}</p>
          <p className="text-gray-600">Check availability to see start time</p>

          <h2 className="text-xl font-bold mt-6 mb-2">Experience</h2>
          <h3 className="text-2xl font-bold mb-4">Itinerary</h3>
          <div className="relative">
            {guidePost.itinerary.map((item, index) => (
              <div key={index} className="mb-8 flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  {index < guidePost.itinerary.length - 1 && (
                    <div className="w-0.5 h-full bg-green-600 border-dashed border-l border-green-600"></div>
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

        <Card className="md:sticky md:top-4 h-fit">
          <CardHeader>
            <CardTitle>Select a date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => 
                  date < new Date() || !isDateAvailable(date)
                }
                modifiers={{
                  available: (date) => isDateAvailable(date)
                }}
                modifiersStyles={{
                  available: { backgroundColor: '#e6ffe6' }
                }}
                className="rounded-md border"
              />
            </div>
            {selectedDate && (
              <p className="text-green-500 mt-2 text-center">
                Selected date: {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            )}
            <div className="flex items-center mt-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={guidePost.user.avatarUrl || undefined} alt={guidePost.user.hostName || guidePost.user.name} />
                <AvatarFallback>{guidePost.user.hostName?.[0] || guidePost.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="font-bold">Hosted by: {guidePost.user.hostName || guidePost.user.name}</p>
                <p className="text-sm text-gray-600">{guidePost.user.guideProfile?.description}</p>
              </div>
            </div>
            <div className="border-t mt-4 pt-4">
              <p className="font-bold">Price</p>
              <p>${guidePost.price}</p>
            </div>
            <Button 
              onClick={handleBooking} 
              className="w-full mt-4"
              disabled={!selectedDate || bookingInProgress}
            >
              {bookingInProgress ? 'Booking...' : 'Book'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <hr className="my-8" />

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-2">Highlight</h2>
          <p>{guidePost.highlight}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Full Description</h2>
          <p>{guidePost.fullDescription}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Includes</h2>
          <p>{guidePost.include}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Not suitable for</h2>
          <p>{guidePost.notSuitableFor}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Important information</h2>
          <p>{guidePost.importantInfo}</p>
        </section>
      </div>

      <p className="text-sm text-gray-600 mt-8">
        <span className="inline-block mr-2">ⓘ</span>
        For reference only, itineraries are subject to change.
      </p>
    </div>
  );
};

export default Detail;