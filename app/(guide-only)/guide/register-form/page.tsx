import RegisterFormGuide from '@/components/Guide/RegisterFormGuide';
import React from 'react';

export default function Page() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(161,129,103,0.12),_transparent_26%),linear-gradient(180deg,_#f6f1ea_0%,_#ffffff_46%,_#f7fafb_100%)] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b6a53]">
              Become a Guide
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-[#2d241d] sm:text-5xl md:text-6xl">
              Join as a trusted local guide.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Submit a professional application with your identity, guiding
              credentials, and supporting documents. Each application is
              reviewed before your guide profile goes live on the platform.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <div className="rounded-full border border-[#e5d9ce] bg-white/80 px-4 py-2">
                3-step application
              </div>
              <div className="rounded-full border border-[#e5d9ce] bg-white/80 px-4 py-2">
                Secure document review
              </div>
              <div className="rounded-full border border-[#e5d9ce] bg-white/80 px-4 py-2">
                Manual approval process
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e4d8cd] bg-white/95 p-7 shadow-[0_28px_90px_-56px_rgba(38,29,21,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b6a53]">
              Application Standards
            </p>
            <div className="mt-5 space-y-5 text-sm text-slate-600">
              <div>
                <p className="font-medium text-[#2d241d]">Identity check</p>
                <p className="mt-1">Prepare a clear passport or national ID document.</p>
              </div>
              <div>
                <p className="font-medium text-[#2d241d]">License verification</p>
                <p className="mt-1">Your guide license and certificate should be valid and readable.</p>
              </div>
              <div>
                <p className="font-medium text-[#2d241d]">Profile readiness</p>
                <p className="mt-1">List the languages and specialist areas you want travelers to see.</p>
              </div>
            </div>
          </div>
        </div>

        <RegisterFormGuide />
      </div>
    </div>
  );
}
