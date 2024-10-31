// components/Posts/Posts.tsx
'use client'
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "./PostCard";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { CambodiaProvince, PostArea, PostCategory } from '@prisma/client';
import type { PostsResponse } from '@/types/api';

type FilterLocation = CambodiaProvince | 'All';
type FilterArea = PostArea | 'All';
type FilterCategory = PostCategory | 'All';
type SortBy = 'latest' | 'popular' | 'comments';

interface Filters {
  location: FilterLocation;
  area: FilterArea;
  category: FilterCategory;
  search: string;
  sortBy: SortBy;
}

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'comments', label: 'Most Comments' },
] as const;

const LOCATIONS: FilterLocation[] = ['All', ...Object.values(CambodiaProvince)];
const AREAS: FilterArea[] = ['All', ...Object.values(PostArea)];
const CATEGORIES: FilterCategory[] = ['All', ...Object.values(PostCategory)];

export function Posts() {
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<Filters>({
    location: 'All',
    area: 'All',
    category: 'All',
    search: '',
    sortBy: 'latest',
  });

  const debouncedSearch = useDebounce(filters.search, 500);
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ['posts', { ...filters, search: debouncedSearch }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(pageParam));
      
      if (filters.location !== 'All') {
        searchParams.set('location', filters.location);
      }
      if (filters.area !== 'All') {
        searchParams.set('area', filters.area);
      }
      if (filters.category !== 'All') {
        searchParams.set('category', filters.category);
      }
      if (debouncedSearch) {
        searchParams.set('search', debouncedSearch);
      }
      searchParams.set('sortBy', filters.sortBy);

      const res = await fetch(`/api/posts?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.metadata.hasMore) {
        return lastPage.metadata.page + 1;
      }
      return undefined;
    },
  });

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      location: 'All',
      area: 'All',
      category: 'All',
      search: '',
      sortBy: 'latest',
    });
  };

  const isFiltersActive = filters.location !== 'All' || 
    filters.area !== 'All' || 
    filters.category !== 'All' || 
    filters.search !== '' || 
    filters.sortBy !== 'latest';

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading posts</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-accent' : ''}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.location}
              onValueChange={(value: FilterLocation) => 
                handleFilterChange('location', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location === 'All' ? 'All Locations' : location.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.area}
              onValueChange={(value: FilterArea) => 
                handleFilterChange('area', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area === 'All' ? 'All Areas' : area.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(value: FilterCategory) => 
                handleFilterChange('category', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value: SortBy) => 
                handleFilterChange('sortBy', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      {isFiltersActive && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-8"
          >
            Reset filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.pages.map((page, i) =>
          page.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {/* Empty State */}
      {data?.pages[0].posts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No posts found</p>
          {isFiltersActive && (
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="mt-4"
            >
              Reset filters
            </Button>
          )}
        </div>
      )}

      {/* Loading States */}
      {(isLoading || isFetchingNextPage) && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Load More Trigger */}
      {hasNextPage && <div ref={ref} className="h-1" />}
    </div>
  );
}