"use client";

export function CultureSkeleton() {
  return (
    <section
      className="bg-no-repeat bg-contain bg-center h-full py-12"
      style={{
        backgroundImage: "url(/tree1.svg), url(/tree2.svg)",
        backgroundPosition: "0% 0%, 100% 100%",
        backgroundSize: "251px 300px, 251px 300px",
      }}
    >
      <div className="p-4 sm:p-8 md:p-16 lg:p-36">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Left Column - Image with rotating effect */}
            <div className="relative drop-shadow-lg">
              {/* Background rotated layers */}
              <div className="absolute inset-0 bg-gray-200/80 rounded-lg transform -rotate-3"></div>
              <div className="absolute inset-0 bg-gray-200/80 rounded-lg transform rotate-3"></div>
              {/* Main image skeleton */}
              <div className="relative z-10 w-full aspect-[4/3] rounded-lg bg-gray-200/80 animate-pulse"></div>
            </div>

            {/* Right Column - Content */}
            <div className="md:pl-8 space-y-6">
              {/* "Culture" text */}
              <div className="relative">
                <div className="h-32 w-full bg-gray-200/80 animate-pulse rounded-lg text-right"></div>
              </div>

              {/* Guide Post label */}
              <div className="h-6 w-24 bg-gray-200/80 animate-pulse rounded"></div>

              {/* Title */}
              <div className="h-12 w-3/4 bg-gray-200/80 animate-pulse rounded"></div>

              {/* Location */}
              <div className="h-8 w-1/2 bg-gray-200/80 animate-pulse rounded"></div>

              {/* Description paragraphs */}
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
                <div className="flex items-center space-x-2">
                  {/* Previous button */}
                  <div className="h-10 w-28 bg-gray-200/80 animate-pulse rounded"></div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Next button */}
                  <div className="h-10 w-28 bg-gray-200/80 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
