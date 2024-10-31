"use client";
import { Skeleton } from "@/components/ui/skeleton";

export function NatureSkeleton() {
  return (
    <section
      className="py-12 bg-no-repeat bg-cover bg-bottom rounded-t-3xl drop-shadow"
      style={{
        backgroundImage: "url(bannerBg.svg)",
      }}
    >
      <div className="min-h-screen p-8 sm:p-16 md:p-36">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Left Column - Image */}
            <div className="relative">
              {/* Rotated backgrounds */}
              <div className="absolute inset-0 bg-gray-200/80 rounded-lg transform -rotate-3"></div>
              <div className="absolute inset-0 bg-gray-200/80 rounded-lg transform rotate-3"></div>
              {/* Main image skeleton */}
              <div className="relative z-10 w-full aspect-[4/3] rounded-lg bg-gray-200/80 animate-pulse"></div>
            </div>

            {/* Right Column - Content */}
            <div className="pl-0 md:pl-8 space-y-6">
              {/* Nature text */}
              <div className="text-right mb-6">
                <div className="h-24 md:h-32 w-full bg-gray-200/80 animate-pulse rounded-lg"></div>
              </div>

              {/* Guide Post label */}
              <div className="h-6 w-24 bg-gray-200/80 animate-pulse rounded"></div>

              {/* Title */}
              <div className="h-10 w-3/4 bg-gray-200/80 animate-pulse rounded"></div>

              {/* Location */}
              <div className="h-8 w-1/2 bg-gray-200/80 animate-pulse rounded"></div>

              {/* Description lines */}
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200/80 animate-pulse rounded"></div>
                <div className="h-4 w-full bg-gray-200/80 animate-pulse rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200/80 animate-pulse rounded"></div>
                <div className="h-4 w-full bg-gray-200/80 animate-pulse rounded"></div>
                <div className="h-4 w-2/3 bg-gray-200/80 animate-pulse rounded"></div>
              </div>

              {/* Area */}
              <div className="h-6 w-32 bg-gray-200/80 animate-pulse rounded"></div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-4">
                <div className="h-8 w-24 bg-gray-200/80 animate-pulse rounded"></div>
                <div className="h-8 w-24 bg-gray-200/80 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}