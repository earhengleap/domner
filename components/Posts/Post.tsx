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
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
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

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function Posts() {
  const [showFilters, setShowFilters] = React.useState(true);
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
    refetch,
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
      const payload: PostsResponse = await res.json();

      payload.posts = payload.posts.map((post) => ({
        ...post,
        isLiked: Array.isArray(post.likes) && post.likes.length > 0,
      }));

      return payload;
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

  const allPosts = React.useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data]
  );

  const metadata = data?.pages[0]?.metadata;
  const totalMatches = metadata?.total ?? 0;
  const visibleCount = allPosts.length;
  const totalLikes = allPosts.reduce((acc, post) => acc + post._count.likes, 0);
  const totalComments = allPosts.reduce((acc, post) => acc + post._count.comments, 0);
  const quickCategoryCounts = React.useMemo(() => {
    return allPosts.reduce<Record<string, number>>((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {});
  }, [allPosts]);

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/70 py-10 text-center">
        <p className="text-red-600 font-medium">Error loading posts</p>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#eaded3] shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#8b6a53]">
                <Sparkles className="h-3.5 w-3.5" />
                Dynamic Feed
              </p>
              <h2 className="text-lg font-semibold text-[#2d241d]">Filter, discover, and browse posts</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`${showFilters ? 'bg-[#f8f2ec] border-[#d7c0af] text-[#6f4e37]' : ''}`}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              {isFiltersActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-[#8b6a53] hover:bg-[#f8f2ec]"
                >
                  Reset
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts by caption..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="h-11 rounded-xl border-[#d8c2ad]/60 bg-white pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-[#eaded3] bg-[#fffdfa] px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-[#8b6a53]">Results</p>
              <p className="mt-0.5 text-lg font-semibold text-[#2d241d]">
                {isLoading ? "--" : totalMatches.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-[#eaded3] bg-[#fffdfa] px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-[#8b6a53]">Loaded</p>
              <p className="mt-0.5 text-lg font-semibold text-[#2d241d]">{visibleCount.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-[#eaded3] bg-[#fffdfa] px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-[#8b6a53]">Likes</p>
              <p className="mt-0.5 text-lg font-semibold text-[#2d241d]">{totalLikes.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-[#eaded3] bg-[#fffdfa] px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-[#8b6a53]">Comments</p>
              <p className="mt-0.5 text-lg font-semibold text-[#2d241d]">{totalComments.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((category) => category !== 'All').map((category) => {
              const isActive = filters.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleFilterChange('category', isActive ? 'All' : category)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-[#A18167] bg-[#A18167] text-white'
                      : 'border-[#d7c0af] bg-white text-[#6f4e37] hover:bg-[#f8f2ec]'
                  }`}
                >
                  {formatEnumLabel(category)}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-white/20' : 'bg-[#f4ebe3]'}`}>
                    {quickCategoryCounts[category] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showFilters && (
        <Card className="border-slate-200">
          <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
            <Select
              value={filters.location}
              onValueChange={(value: FilterLocation) =>
                handleFilterChange('location', value)
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location === 'All' ? 'All Locations' : formatEnumLabel(location)}
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
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area === 'All' ? 'All Areas' : formatEnumLabel(area)}
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
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'All' ? 'All Categories' : formatEnumLabel(category)}
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
              <SelectTrigger className="h-10 rounded-xl">
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

      {isFiltersActive && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.location !== 'All' && (
            <Badge variant="outline" className="border-[#d7c0af] text-[#6f4e37]">
              Location: {formatEnumLabel(filters.location)}
            </Badge>
          )}
          {filters.area !== 'All' && (
            <Badge variant="outline" className="border-[#d7c0af] text-[#6f4e37]">
              Area: {formatEnumLabel(filters.area)}
            </Badge>
          )}
          {filters.category !== 'All' && (
            <Badge variant="outline" className="border-[#d7c0af] text-[#6f4e37]">
              Category: {formatEnumLabel(filters.category)}
            </Badge>
          )}
          {filters.search && (
            <Badge variant="outline" className="border-[#d7c0af] text-[#6f4e37]">
              Search: {filters.search}
            </Badge>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : allPosts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center">
          <p className="text-base font-medium text-slate-700">No posts found for your filters.</p>
          <p className="mt-2 text-sm text-slate-500">Try adjusting category, location, or search keyword.</p>
          {isFiltersActive && (
            <Button variant="outline" onClick={handleResetFilters} className="mt-4">
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {hasNextPage && <div ref={ref} className="h-1" />}
      {!hasNextPage && !isLoading && allPosts.length > 0 && (
        <p className="text-center text-sm text-slate-500 py-2">
          You have reached the end of the feed.
        </p>
      )}
    </div>
  );
}
