"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FilterComponents from "@/components/Search/FilterComponents";
import SearchComponents from "@/components/Search/SearchComponents";

interface TripCard {
  id: string;
  photos: string[];
  title: string;
  guide: string;
  date: string;
  price: number;
  location: string;
  area: string;
  experience: string;
  language: string;
  yearsOfExperience: number;
  languagesSpoken: string[];
}

interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  experiences: string[];
  languages: string[];
  yearsOfExperience: number[];
  languagesSpoken: string[];
}

const SlugPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [trips, setTrips] = useState<TripCard[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TripCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageType, setPageType] = useState<"attraction" | "location">(
    "location"
  );
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    minPrice: 0,
    maxPrice: 1000,
    experiences: [],
    languages: [],
    yearsOfExperience: [],
    languagesSpoken: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pathname) {
      const segments = pathname.split("/").filter(Boolean);
      const type = segments[0] === "attractions" ? "attraction" : "location";
      const term = segments.slice(1).join(" ").replace(/-/g, " ");
      setSearchTerm(term);
      setPageType(type);
      fetchTrips(term, type);
    }
  }, [pathname]);

  const fetchTrips = useCallback(async (term: string, type: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching trips with term: ${term} and type: ${type}`);
      const response = await axios.get("/api/trips", {
        params: { search: term, type: type },
      });
      console.log("Received trip data:", response.data);
      if (Array.isArray(response.data.trips)) {
        setTrips(response.data.trips);
        setFilteredTrips(response.data.trips);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      setError("Failed to fetch trips. Please try again.");
      setTrips([]);
      setFilteredTrips([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (trips.length > 0) {
      applyFilters();
    }
  }, [trips, filterOptions]);

  const applyFilters = useCallback(() => {
    if (!trips || trips.length === 0) return;

    const filtered = trips.filter((trip) => {
      const priceInRange =
        trip.price >= filterOptions.minPrice &&
        trip.price <= filterOptions.maxPrice;
      const experienceMatch =
        filterOptions.experiences.length === 0 ||
        filterOptions.experiences.includes(trip.experience);
      const languageMatch =
        filterOptions.languages.length === 0 ||
        filterOptions.languages.includes(trip.language);
      const yearsOfExperienceMatch =
        filterOptions.yearsOfExperience.length === 0 ||
        filterOptions.yearsOfExperience.includes(trip.yearsOfExperience);
      const languagesSpokenMatch =
        filterOptions.languagesSpoken.length === 0 ||
        filterOptions.languagesSpoken.some((lang) =>
          trip.languagesSpoken.includes(lang)
        );

      return (
        priceInRange &&
        experienceMatch &&
        languageMatch &&
        yearsOfExperienceMatch &&
        languagesSpokenMatch
      );
    });
    setFilteredTrips(filtered);
  }, [trips, filterOptions]);

  const handleFilterChange = useCallback(
    (key: keyof FilterOptions, value: any) => {
      setFilterOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const renderHeading = useCallback(() => {
    const formattedSearchTerm =
      searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
    return (
      <h1 className="text-3xl font-bold">
        {pageType === "location"
          ? `Trips in ${formattedSearchTerm}`
          : `Trips to ${formattedSearchTerm}`}
      </h1>
    );
  }, [pageType, searchTerm]);

  // Combined navigation handler
  const handleNavigateToGuide = useCallback(
    async (tripId: string) => {
      if (!tripId) {
        console.error("No trip ID provided");
        return;
      }

      try {
        // First fetch the guide post data
        await axios.get(`/api/guide/${tripId}`);
        // Then navigate to the guide page
        router.push(`/guide/${tripId}`);
      } catch (error) {
        console.error("Error navigating to guide:", error);
        setError("Failed to load guide details. Please try again.");
      }
    },
    [router]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 mt-20">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 mt-20">
        <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchComponents />
      <div className="mb-6 mt-20 flex flex-col md:flex-row justify-between items-center gap-4">
        {renderHeading()}
        <FilterComponents
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
        />
      </div>

      {filteredTrips.length === 0 ? (
        <div className="text-center mt-6 p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600">
            No trips found for this search.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTrips.map((trip) => (
            <Card
              key={trip.id}
              onClick={() => handleNavigateToGuide(trip.id)}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
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
                <CardTitle className="text-lg mb-2 line-clamp-2">
                  {trip.title}
                </CardTitle>
                <p className="text-sm text-gray-600">Guide: {trip.guide}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(trip.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Location: {trip.location}
                </p>
                <p className="text-sm text-gray-600">Area: {trip.area}</p>
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
                  Languages: {trip.languagesSpoken.join(", ")}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <span className="text-sm font-semibold">
                  From ${trip.price.toFixed(2)}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SlugPage;
