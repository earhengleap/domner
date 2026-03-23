"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ExploreHero from "@/components/Explore/ExploreHero";
import ExploreCategories, { ExploreCategory } from "@/components/Explore/ExploreCategories";
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

const defaultExploreCategories: Array<{ id: string; name: string; image: string }> = [
  {
    id: "nature",
    name: "Nature",
    image: "/mondolkiri.jpg",
  },
  {
    id: "culture",
    name: "Culture",
    image: "/TahProhm.jpg",
  },
  {
    id: "adventure",
    name: "Adventure",
    image: "/Virachey.jpg",
  },
  {
    id: "food",
    name: "Food",
    image: "/Kampot.webp",
  },
  {
    id: "photography",
    name: "Photography",
    image: "/takeo01.jpg",
  },
  {
    id: "discover",
    name: "Discover",
    image: "/siem-reap.jpg",
  },
];

const toCategoryId = (value?: string) => {
  const normalized = normalizeExperience(value).toLowerCase().replace(/\s+/g, "-");

  if (normalized === "discover" || normalized === "discovery" || normalized === "discoveries") {
    return "discover";
  }

  return normalized;
};

const normalizeExperience = (value?: string) => {
  return (value || "General").trim() || "General";
};

const ExplorePage = () => {
  const [trips, setTrips] = useState<TripCard[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
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

  const dynamicCategories = useMemo<ExploreCategory[]>(() => {
    const grouped = new Map<string, { name: string; count: number; image?: string }>();

    for (const trip of trips) {
      const name = normalizeExperience(trip.experience);
      const id = toCategoryId(name);
      const existing = grouped.get(id);

      if (existing) {
        existing.count += 1;
        if (!existing.image && trip.photos?.[0]) {
          existing.image = trip.photos[0];
        }
      } else {
        grouped.set(id, {
          name,
          count: 1,
          image: trip.photos?.[0],
        });
      }
    }

    const seededCategories: ExploreCategory[] = defaultExploreCategories.map((category) => {
      const dynamic = grouped.get(category.id);
      return {
        id: category.id,
        name: category.name,
        count: dynamic?.count || 0,
        image: dynamic?.image || category.image,
      };
    });

    const seededIds = new Set(seededCategories.map((category) => category.id));
    const additionalDynamicCategories = Array.from(grouped.entries())
      .filter(([id]) => !seededIds.has(id))
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.count - a.count);

    return [...seededCategories, ...additionalDynamicCategories];
  }, [trips]);

  const filteredTrips = useMemo(() => {
    if (activeCategory === "all") return trips;
    return trips.filter((trip) => {
      const tripId = toCategoryId(trip.experience);
      return tripId === activeCategory;
    });
  }, [trips, activeCategory]);

  const activeCategoryLabel = useMemo(() => {
    if (activeCategory === "all") return "all categories";
    return dynamicCategories.find((category) => category.id === activeCategory)?.name || "selected category";
  }, [activeCategory, dynamicCategories]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <ExploreHero />
      <ExploreCategories
        categories={dynamicCategories}
        activeCategory={activeCategory}
        totalTrips={trips.length}
        onCategorySelect={setActiveCategory}
      />

      <section className="px-4 max-w-7xl mx-auto mt-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Experiences</h2>
            <p className="text-gray-600">
              {filteredTrips.length} trip{filteredTrips.length === 1 ? "" : "s"} in {activeCategoryLabel}.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setActiveCategory("all")}
            className="text-primary font-semibold hover:bg-primary/10 transition-colors"
          >
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
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
            <p className="text-gray-700 font-medium">No trips in this category yet.</p>
            <p className="text-sm text-gray-500 mt-2">Try another category or click View All.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredTrips.map((trip, index) => (
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
                        src={trip.photos[0] || "/default-image.png"}
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
                          <span className="text-xs font-bold text-primary">{trip.guide?.[0] || "G"}</span>
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
