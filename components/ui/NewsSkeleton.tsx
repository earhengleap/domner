"use client";
import React from "react";

export function NewsSkeleton() {
  // Create an array to represent visible slides based on screen size
  const visibleSlides = [1, 2, 3]; // Default to 3 slides

  return (
    <section className="rounded-3xl">
      <div className="py-10 max-w-6xl mx-auto px-4">
        {/* Title Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="h-12 w-32 bg-gray-200/80 animate-pulse rounded-lg" />
        </div>

        {/* Slider Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleSlides.map((index) => (
            <div key={index} className="p-4">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Image Skeleton */}
                <div className="w-full h-48 bg-gray-200/80 animate-pulse" />
                
                {/* Content Container */}
                <div className="p-4 space-y-4">
                  {/* Date Skeleton */}
                  <div className="h-4 w-24 bg-gray-200/80 animate-pulse rounded" />
                  
                  {/* Title Skeleton */}
                  <div className="h-6 w-3/4 bg-gray-200/80 animate-pulse rounded" />
                  
                  {/* Description Skeleton - Multiple lines */}
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200/80 animate-pulse rounded" />
                    <div className="h-4 w-full bg-gray-200/80 animate-pulse rounded" />
                    <div className="h-4 w-2/3 bg-gray-200/80 animate-pulse rounded" />
                  </div>
                  
                  {/* Tag Skeleton */}
                  <div className="h-6 w-16 bg-gray-200/80 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Skeleton */}
        <div className="flex justify-center mt-6 space-x-2">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 rounded-full bg-gray-200/80 animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  );
}