// app/guide/[guidePostId]/page.tsx
'use client';

import { useParams } from "next/navigation";
import  GuidePostDetail  from "@/app/(frontend)/guide-posts/[guidePostId]/page";
import  ErrorBoundary  from "@/components/ErrorBoundary";

export default function GuidePage() {
  const params = useParams();
  const guidePostId = params.guidePostId as string;

  if (!guidePostId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Guide Post</h2>
          <p className="text-gray-600">The requested guide post could not be found</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <GuidePostDetail params={{ guidePostId }} />
      </div>
    </ErrorBoundary>
  );
}