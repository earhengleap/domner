"use client";
import React from "react";

export function TopValuesSkeleton() {
  return (
    <section
      className="bg-no-repeat bg-center h-full py-12"
      style={{
        backgroundImage: "url(/manDirect.svg)",
        backgroundPosition: "125% 80%",
        backgroundSize: "50% 50%",
      }}
    >
      <div className="py-10 max-w-6xl w-full h-full mx-auto p-2 flex items-center flex-col gap-8">
        {/* Title and Subtitle Skeletons */}
        <div className="w-full space-y-4">
          <div className="flex justify-center">
            <div className="h-9 w-64 bg-gray-200/80 animate-pulse rounded-lg" />
          </div>
          <div className="flex justify-center">
            <div className="h-7 w-96 bg-gray-200/80 animate-pulse rounded-lg" />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6">
          {/* Generate 3 card skeletons */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[320px] w-full flex items-center flex-col gap-6 p-4 text-center justify-center bg-white rounded-lg shadow-sm"
            >
              {/* Icon skeleton */}
              <div className="border border-gray-200/80 p-4 rounded-xl">
                <div className="w-[35px] h-[35px] bg-gray-200/80 animate-pulse rounded-md" />
              </div>

              {/* Title skeleton */}
              <div className="w-40 h-8 bg-gray-200/80 animate-pulse rounded-lg" />

              {/* Description skeleton */}
              <div className="space-y-2 w-[80%] md:w-[65%]">
                <div className="h-5 w-full bg-gray-200/80 animate-pulse rounded-lg" />
                <div className="h-5 w-4/5 bg-gray-200/80 animate-pulse rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
