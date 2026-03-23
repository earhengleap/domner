"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { hasAdminAccess } from "@/lib/access";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

interface Application {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
  currentAddress: string;
  guideLicenseNumber: string;
  licenseExpiryDate: string;
  yearsOfExperience: number;
  areaOfExpertise: string;
  facebookLink?: string;
  languagesSpoken: string[];
  specializedArea?: string;
  nationalIdPassportUrl?: string;
  guideCertificationUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApplicationDetail() {
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !hasAdminAccess(session.user)) {
      router.push("/login");
      return;
    }
    void fetchApplication();
  }, [session, status, router, id]);

  const fetchApplication = async () => {
    try {
      setError(null);
      const res = await fetch(`/api/admin/applications/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch application");
      const data = await res.json();
      setApplication(data);
    } catch (err) {
      setError("Error fetching application details");
      console.error(err);
    }
  };

  const handleStatusUpdate = async (newStatus: "APPROVED" | "REJECTED") => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update application status");
      await fetchApplication();
    } catch (err) {
      setError("Error updating application status");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
        {error}
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  const statusColors = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const infoItems: Array<{ label: string; value: string }> = [
    { label: "Full Name", value: application.fullName },
    { label: "Date Of Birth", value: formatDate(application.dateOfBirth) },
    { label: "Gender", value: application.gender },
    { label: "Phone Number", value: application.phoneNumber },
    { label: "Email", value: application.emailAddress },
    { label: "Current Address", value: application.currentAddress },
    { label: "License Number", value: application.guideLicenseNumber },
    { label: "License Expiry", value: formatDate(application.licenseExpiryDate) },
    { label: "Years Of Experience", value: String(application.yearsOfExperience) },
    { label: "Area Of Expertise", value: application.areaOfExpertise },
    {
      label: "Languages Spoken",
      value: Array.isArray(application.languagesSpoken)
        ? application.languagesSpoken.join(", ")
        : "-",
    },
    { label: "Specialized Area", value: application.specializedArea || "-" },
    { label: "Submitted", value: formatDate(application.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Application Detail</h1>
            <p className="text-sm text-slate-500 mt-1">Review guide application information and documents.</p>
            <p className="text-sm text-slate-600 mt-2">{application.emailAddress}</p>
          </div>

          <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[application.status]}`}>
            {application.status}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Applicant Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {infoItems.map((item) => (
            <article key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="text-sm font-medium text-slate-900 mt-1 break-words">{item.value || "-"}</p>
            </article>
          ))}

          {application.facebookLink && (
            <article className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Facebook Link</p>
              <a
                href={application.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#A18167] hover:text-[#8e6f56] mt-1 inline-block break-all"
              >
                {application.facebookLink}
              </a>
            </article>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {application.nationalIdPassportUrl ? (
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-800 mb-2">National ID / Passport</p>
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={application.nationalIdPassportUrl}
                  alt="National ID Passport"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No national ID/passport document.
            </div>
          )}

          {application.guideCertificationUrl ? (
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-800 mb-2">Guide Certification</p>
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={application.guideCertificationUrl}
                  alt="Guide Certification"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No guide certification document.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/admin/guide-applications"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>

          {application.status === "PENDING" ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void handleStatusUpdate("REJECTED")}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-70"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={() => void handleStatusUpdate("APPROVED")}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              This application has been {application.status.toLowerCase()}.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
