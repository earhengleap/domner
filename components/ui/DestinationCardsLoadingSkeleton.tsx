import { Skeleton } from "@/components/ui/skeleton";

export function DestinationSkeleton() {
  return (
    <div className="places-card-wrapper">
      {/* Title Skeleton */}
      <div className="flex flex-col gap-2 mb-8">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-2 w-32" />
      </div>

      <div className="container-box">
        {/* Featured Place Skeleton */}
        <div className="featured-place">
          <Skeleton className="w-full h-full rounded-lg" />
          <div className="place-info">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        <div className="secondary-places">
          {/* Left Card Skeleton */}
          <div className="left-card">
            <Skeleton className="w-full h-full rounded-lg" />
            <div className="place-info">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>

          {/* Right Cards Skeleton */}
          <div className="right-cards">
            {[1, 2].map((index) => (
              <div key={index} className="place-card">
                <Skeleton className="w-full h-full rounded-lg" />
                <div className="place-info">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

