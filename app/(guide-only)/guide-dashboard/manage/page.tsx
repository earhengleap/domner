"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, Edit3, Loader2, MapPin, Search, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { ManagePostEditor, ManageableGuidePost } from "@/components/Guide/ManagePostEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GuidePostListItem = {
  id: string;
  title: string;
  location: string;
  area: string;
  type: string;
  price: number;
  image: string;
  createdAt: string;
  updatedAt: string;
  availableDateCount: number;
  lockedDateCount: number;
  nextAvailableDate?: string | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No upcoming date";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(parsed);
}

export default function ManagePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [posts, setPosts] = useState<GuidePostListItem[]>([]);
  const [selectedPost, setSelectedPost] = useState<ManageableGuidePost | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    void fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/guide-posts?view=summary", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load guide posts");
      }

      const data = (await response.json()) as GuidePostListItem[];
      setPosts(data);
    } catch (error) {
      console.error("Error fetching guide posts:", error);
      toast.error("Unable to load your posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetail = async (postId: string) => {
    setSelectedPostId(postId);

    try {
      const response = await fetch(`/api/guide-posts/${postId}`, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load post details");
      }

      const data = (await response.json()) as ManageableGuidePost;
      setSelectedPost(data);
    } catch (error) {
      console.error("Error fetching post detail:", error);
      toast.error("Unable to open the post editor");
    }
  };

  const handleSave = async (post: ManageableGuidePost) => {
    setSubmitting(true);

    try {
      const response = await fetch(`/api/guide-posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      const updatedPost = (await response.json()) as ManageableGuidePost;
      setSelectedPost(updatedPost);
      await fetchPosts();
      toast.success("Post updated");
    } catch (error) {
      console.error("Error updating guide post:", error);
      toast.error("Unable to save changes");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (post: GuidePostListItem) => {
    if (post.lockedDateCount > 0) {
      toast.error("This post has active bookings and cannot be deleted safely right now.");
      return;
    }

    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/guide-posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      if (selectedPostId === post.id) {
        setSelectedPost(null);
        setSelectedPostId(null);
      }

      await fetchPosts();
      toast.success("Post deleted");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Unable to delete post");
    }
  };

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return posts
      .filter((post) => {
        if (typeFilter !== "all" && post.type !== typeFilter) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return [post.title, post.location, post.area, post.type]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .sort((left, right) => {
        switch (sortBy) {
          case "price-high":
            return right.price - left.price;
          case "price-low":
            return left.price - right.price;
          case "available":
            return right.availableDateCount - left.availableDateCount;
          case "title":
            return left.title.localeCompare(right.title);
          case "recent":
          default:
            return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
        }
      });
  }, [posts, search, sortBy, typeFilter]);

  const typeOptions = useMemo(
    () => Array.from(new Set(posts.map((post) => post.type).filter(Boolean))).sort(),
    [posts]
  );

  const totalOpenDates = posts.reduce((sum, post) => sum + post.availableDateCount, 0);
  const totalLockedDates = posts.reduce((sum, post) => sum + post.lockedDateCount, 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_48%,_#eefbf5_100%)] px-4 pb-8 pt-28 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit bg-emerald-600 text-white hover:bg-emerald-600">Guide Workspace</Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Manage your travel posts</h1>
                <p className="max-w-2xl text-sm text-slate-600">
                  Update post details, keep your calendar accurate, and protect dates that already have active bookings.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border-slate-200 shadow-none">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-500">Active posts</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{posts.length}</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-none">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-500">Open dates</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{totalOpenDates}</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-none">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-500">Booked dates locked</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{totalLockedDates}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[0.9fr,1.35fr]">
          <section className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="grid gap-3 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title, location, area, or type"
                    className="pl-9"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {typeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort posts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most recently updated</SelectItem>
                      <SelectItem value="available">Most open dates</SelectItem>
                      <SelectItem value="price-high">Highest price</SelectItem>
                      <SelectItem value="price-low">Lowest price</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {loading ? (
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="flex items-center justify-center p-8 text-slate-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
                    Loading posts...
                  </CardContent>
                </Card>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const isSelected = post.id === selectedPostId;

                  return (
                    <Card
                      key={post.id}
                      className={`overflow-hidden border transition ${
                        isSelected ? "border-emerald-300 shadow-md shadow-emerald-100" : "border-slate-200 shadow-sm"
                      }`}
                    >
                      <CardContent className="p-0">
                        <div className="grid gap-0 sm:grid-cols-[160px,1fr]">
                          <div className="relative h-44 sm:h-full">
                            <Image
                              src={post.image || "/default-image.png"}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 160px"
                            />
                          </div>
                          <div className="space-y-4 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  <Badge className="bg-slate-900 text-white hover:bg-slate-900">{post.type}</Badge>
                                  {post.lockedDateCount > 0 ? (
                                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                                      {post.lockedDateCount} booked
                                    </Badge>
                                  ) : null}
                                </div>
                                <h2 className="text-lg font-semibold text-slate-950">{post.title}</h2>
                                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                                  <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                    {post.location}, {post.area}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                                    Next date {formatDate(post.nextAvailableDate)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-slate-950">{formatCurrency(post.price)}</div>
                                <div className="whitespace-nowrap text-sm text-slate-500">{post.availableDateCount} open dates</div>
                              </div>
                            </div>

                            <div className="grid gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-2">
                              <div>
                                <div className="text-xs uppercase tracking-wide text-slate-400">Updated</div>
                                <div className="mt-1 font-medium text-slate-900">{formatDate(post.updatedAt)}</div>
                              </div>
                              <div>
                                <div className="text-xs uppercase tracking-wide text-slate-400">Open calendar</div>
                                <div className="mt-1 whitespace-nowrap font-medium text-slate-900">{post.availableDateCount} dates ready</div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                              <Button
                                type="button"
                                onClick={() => void fetchPostDetail(post.id)}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Edit3 className="mr-2 h-4 w-4" />
                                {isSelected ? "Refresh editor" : "Open editor"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => void handleDelete(post)}
                                disabled={post.lockedDateCount > 0}
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="space-y-2 p-8 text-center">
                    <h2 className="text-lg font-semibold text-slate-900">No matching posts</h2>
                    <p className="text-sm text-slate-500">Try a different search term or reset the filters.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          <section>
            {selectedPost ? (
              <ManagePostEditor
                post={selectedPost}
                onSubmit={handleSave}
                onCancel={() => {
                  setSelectedPost(null);
                  setSelectedPostId(null);
                }}
              />
            ) : (
              <Card className="border-dashed border-slate-300 bg-white/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Post editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6 text-sm text-slate-600">
                  <p>Select any post from the left to update itinerary, pricing, links, photos, and available dates.</p>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-medium text-slate-900">What is protected automatically</div>
                    <ul className="mt-2 space-y-2">
                      <li>Booked dates stay locked and cannot be removed from the calendar.</li>
                      <li>Posts with active bookings are blocked from deletion.</li>
                      <li>Changes stay inside your own guide account only.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {submitting ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-700 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving your post updates...
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
