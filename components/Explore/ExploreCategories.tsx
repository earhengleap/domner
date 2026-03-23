"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, Landmark, MapPinned, Mountain, Palmtree, Sparkles } from "lucide-react";

export interface ExploreCategory {
  id: string;
  name: string;
  count: number;
  image?: string;
}

interface ExploreCategoriesProps {
  categories: ExploreCategory[];
  activeCategory: string;
  totalTrips: number;
  onCategorySelect: (categoryId: string) => void;
}

const iconSet = [Compass, Palmtree, Landmark, Mountain, MapPinned, Sparkles];

const ExploreCategories = ({
  categories,
  activeCategory,
  totalTrips,
  onCategorySelect,
}: ExploreCategoriesProps) => {
  const allActive = activeCategory === "all";

  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore Categories</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Dynamic filters with live counts from real guide trips.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCategorySelect("all")}
          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
            allActive
              ? "border-[#A18167] bg-[#A18167] text-white"
              : "border-[#d7c0af] bg-white text-[#6f4e37] hover:bg-[#f8f2ec]"
          }`}
        >
          <Compass className="h-4 w-4" />
          All Experiences
          <span className={`rounded-full px-2 py-0.5 text-xs ${allActive ? "bg-white/20" : "bg-[#f4ebe3]"}`}>
            {totalTrips}
          </span>
        </button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category, index) => {
          const Icon = iconSet[index % iconSet.length];
          const isActive = activeCategory === category.id;
          return (
            <motion.button
              key={category.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              onClick={() => onCategorySelect(category.id)}
              className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                isActive
                  ? "border-[#A18167] shadow-lg shadow-[#A18167]/20"
                  : "border-slate-200 hover:border-[#d7c0af] hover:shadow-md"
              }`}
            >
              <img
                src={category.image || "/Kampot.jpg"}
                alt={category.name}
                className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.src = "/default-image.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <div className="absolute left-3 top-3 rounded-full bg-white/90 p-1.5 text-[#6f4e37]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-[#6f4e37]">
                {category.count}
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-sm font-semibold text-white truncate">{category.name}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center text-slate-500">
          Categories will appear once trips are available.
        </div>
      )}
    </section>
  );
};

export default ExploreCategories;
