"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock3, FileCheck2, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GuideApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type GuideData = {
  fullName: string;
  emailAddress: string;
  guideLicenseNumber: string;
  areaOfExpertise: string;
  yearsOfExperience: number;
  status: GuideApplicationStatus;
};

const GuidePendingPage: React.FC = () => {
  const router = useRouter();
  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchGuideStatus = async () => {
      try {
        const response = await fetch('/api/guide-data', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!isMounted) {
          return;
        }

        setGuideData(data);

        if (data.status === 'APPROVED') {
          router.replace('/guide-dashboard');
          return;
        }

        if (data.status === 'REJECTED') {
          router.replace('/guide/guide-rejected');
        }
      } catch (error) {
        console.error('Error checking guide application status:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchGuideStatus();
    const interval = window.setInterval(fetchGuideStatus, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [router]);

  const statusLabel = useMemo(() => {
    if (!guideData) {
      return 'Preparing application status';
    }
    return guideData.status === 'PENDING' ? 'Waiting for admin approval' : guideData.status;
  }, [guideData]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f6f1ea_0%,_#ffffff_48%,_#f8fafb_100%)] px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[2rem] border border-[#e5d9ce] bg-white p-8 shadow-[0_28px_90px_-56px_rgba(38,29,21,0.45)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eff7f1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2d6a4f]">
              <CheckCircle2 className="h-4 w-4" />
              Application received
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#2d241d]">
              Your guide application is now under review.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              We have received your documents and guide details. The admin team is reviewing
              your application, and this page will update automatically as soon as the status changes.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-[#ece2d8] bg-[#fffdfb] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6a53]">
                    Current status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#2d241d]">{statusLabel}</p>
                </div>
                <div className="rounded-2xl bg-[#f6efe8] p-3 text-[#8b6a53]">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock3 className="h-5 w-5" />}
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#efe5db]">
                <div className="h-full w-2/3 rounded-full bg-[#a18167]" />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-[#ece2d8] bg-white p-5">
                <FileCheck2 className="h-5 w-5 text-[#8b6a53]" />
                <p className="mt-4 text-sm font-semibold text-[#2d241d]">Documents submitted</p>
                <p className="mt-2 text-sm text-slate-500">Your files were uploaded successfully for manual review.</p>
              </div>
              <div className="rounded-3xl border border-[#ece2d8] bg-white p-5">
                <ShieldCheck className="h-5 w-5 text-[#8b6a53]" />
                <p className="mt-4 text-sm font-semibold text-[#2d241d]">Verification in progress</p>
                <p className="mt-2 text-sm text-slate-500">Identity, license, and profile information are being checked.</p>
              </div>
              <div className="rounded-3xl border border-[#ece2d8] bg-white p-5">
                <RefreshCw className="h-5 w-5 text-[#8b6a53]" />
                <p className="mt-4 text-sm font-semibold text-[#2d241d]">Realtime tracking</p>
                <p className="mt-2 text-sm text-slate-500">This page refreshes automatically while you wait for approval.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full bg-[#2f251d] text-white hover:bg-[#1f1812]">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
                className="rounded-full border-[#d7c0af] hover:bg-[#fffaf6]"
              >
                Refresh status
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#e5d9ce] bg-white p-6 shadow-[0_24px_80px_-56px_rgba(38,29,21,0.32)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6a53]">
                Submitted profile
              </p>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Full name</span>
                  <span className="font-medium text-[#2d241d]">{guideData?.fullName || 'Loading...'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-[#2d241d]">{guideData?.emailAddress || 'Loading...'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">License</span>
                  <span className="font-medium text-[#2d241d]">{guideData?.guideLicenseNumber || 'Loading...'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Expertise</span>
                  <span className="font-medium text-[#2d241d]">{guideData?.areaOfExpertise || 'Loading...'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Experience</span>
                  <span className="font-medium text-[#2d241d]">
                    {guideData ? `${guideData.yearsOfExperience} years` : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#e5d9ce] bg-[#fffaf6] p-6">
              <p className="text-sm font-semibold text-[#2d241d]">What happens next</p>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <p>1. The admin team reviews your submitted identity and license documents.</p>
                <p>2. Your profile details are checked for completeness and professionalism.</p>
                <p>3. Once approved, your account will be ready to access the guide dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePendingPage;
