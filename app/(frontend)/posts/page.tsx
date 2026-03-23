// app/posts/page.tsx

import { Posts } from "@/components/Posts/Post";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle, Sparkles, Users, CalendarDays } from "lucide-react";

export default async function PostsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [totalPosts, activeCreators, newThisWeek] = await Promise.all([
    prisma.userPost.count(),
    prisma.userPost.groupBy({ by: ["userId"] }).then((rows) => rows.length),
    prisma.userPost.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-3xl border border-[#dccab9] bg-gradient-to-r from-[#f7efe8] via-[#fdfaf6] to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d8c2ad] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7d624d]">
              <Sparkles className="h-3.5 w-3.5" />
              Community Feed
            </p>
            <h1 className="mt-3 text-3xl font-bold text-[#2d241d] sm:text-4xl">
              Discover Traveler Posts
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#5f5f5f] sm:text-base">
              Explore real stories, local spots, and fresh recommendations from your community.
            </p>
          </div>
          <Link href="/posts/create">
            <button className="inline-flex items-center gap-2 rounded-xl bg-[#292929] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black">
              <PlusCircle className="h-4 w-4" />
              Create Post
            </button>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#eaded3] bg-white/80 p-3">
            <p className="text-xs uppercase tracking-wide text-[#8a6a53]">Total Posts</p>
            <p className="mt-1 text-2xl font-semibold text-[#2d241d]">{totalPosts.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#eaded3] bg-white/80 p-3">
            <p className="text-xs uppercase tracking-wide text-[#8a6a53] inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Active Creators
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#2d241d]">{activeCreators.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#eaded3] bg-white/80 p-3">
            <p className="text-xs uppercase tracking-wide text-[#8a6a53] inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              New This Week
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#2d241d]">{newThisWeek.toLocaleString()}</p>
          </div>
        </div>
      </section>

      <Posts />
    </div>
  );
}
