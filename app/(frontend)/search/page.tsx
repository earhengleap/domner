"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TripCard {
  id: string;
  photos: string[];
  title: string;
  guide: string;
  date: string;
  price: number;
  location: string;
  experience: string;
  language: string;
  yearsOfExperience: number;
  languagesSpoken: string[];
}

const SearchResults = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");
  const [trips, setTrips] = useState<TripCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`Fetching trips with query: ${query}`);
        const response = await fetch(
          `/api/trips?search=${encodeURIComponent(query || "")}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received data:", JSON.stringify(data, null, 2));
        if (Array.isArray(data.trips)) {
          if (
            data.trips.length === 1 &&
            query?.length === 25 &&
            query.startsWith("c")
          ) {
            // If it's a direct ID lookup and we found exactly one result, navigate directly
            router.push(`/guide-posts/${data.trips[0].id}`);
          } else {
            setTrips(data.trips);
          }
        } else {
          setError("Received invalid data format from server");
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
        setError("Failed to fetch trips. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchTrips();
    } else {
      setError("No search query provided");
      setIsLoading(false);
    }
  }, [query, router]);

  const handleCardClick = (tripId: string) => {
    console.log(`Handling click for trip ID: ${tripId}`);
    if (!tripId) {
      console.error("Trip ID is undefined or empty");
      return;
    }
    const url = `/guide/${tripId}`;
    console.log(`Navigating to URL: ${url}`);
    router.push(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="py-36 mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>
      {trips.length === 0 ? (
        <p className="text-center mt-6">No trips found for this search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => handleCardClick(trip.id)}
            >
              <CardHeader className="p-0">
                <Image
                  src={trip.photos[0] || "/placeholder-image.jpg"}
                  alt={trip.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">{trip.title}</CardTitle>
                <p className="text-sm text-gray-600">Guide: {trip.guide}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(trip.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Location: {trip.location}
                </p>
                <p className="text-sm text-gray-600">
                  Experience: {trip.experience}
                </p>
                <p className="text-sm text-gray-600">
                  Language: {trip.language}
                </p>
                <p className="text-sm text-gray-600">
                  Years of Experience: {trip.yearsOfExperience}
                </p>
                <p className="text-sm text-gray-600">
                  Languages Spoken: {trip.languagesSpoken.join(", ")}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <span className="text-sm font-semibold">
                  From ${trip.price.toFixed(2)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Book button clicked");
                    // Add booking logic here if needed
                  }}
                >
                  Book
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
