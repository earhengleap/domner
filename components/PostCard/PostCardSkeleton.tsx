import { Card, CardContent, CardFooter } from "../ui/card";

// components/PostCard/PostCardSkeleton.tsx
export function PostCardSkeleton() {
    return (
      <Card className="overflow-hidden">
        <div className="relative aspect-square bg-muted animate-pulse" />
        <CardContent className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t">
          <div className="w-full flex justify-between">
            <div className="flex space-x-4">
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          </div>
        </CardFooter>
      </Card>
    );
  }