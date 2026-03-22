"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ExploreHero from "@/components/Explore/ExploreHero";
import ExploreCategories from "@/components/Explore/ExploreCategories";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Calendar, Clock } from "lucide-react";

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
}

const ExplorePage = () => {
  const [trips, setTrips] = useState<TripCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAllTrips = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/trips");
        if (Array.isArray(response.data.trips)) {
          setTrips(response.data.trips);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError("Failed to load inspirations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTrips();
  }, []);

  const handleTripClick = (id: string) => {
    router.push(`/guide/${id}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <ExploreHero />
      <ExploreCategories />

      <section className="px-4 max-w-7xl mx-auto mt-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Experiences</h2>
            <p className="text-gray-600">Handpicked journeys for unforgettable memories.</p>
          </div>
          <Button variant="ghost" className="text-primary font-semibold hover:bg-primary/10 transition-colors">
            View All
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[450px] bg-white rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-red-100">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -10 }}
                  className="group"
                  onClick={() => handleTripClick(trip.id)}
                >
                  <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden rounded-2xl cursor-pointer">
                    <CardHeader className="p-0 relative h-72">
                      <Image
                        src={trip.photos[0] || "/placeholder-image.jpg"}
                        alt={trip.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-primary shadow-sm">
                        ${trip.price}
                      </div>
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                          {trip.experience}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{trip.location}</span>
                      </div>
                      <CardTitle className="text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {trip.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span suppressHydrationWarning>{new Date(trip.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Flexible</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{trip.guide[0]}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{trip.guide}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold">4.9</span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default ExplorePage;
