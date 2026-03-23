"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { hasAdminAccess } from "@/lib/access";
import { ClipboardCheck, RefreshCw } from "lucide-react";

interface Application {
  id: string;
  fullName: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const tabs: Array<Application["status"]> = ["PENDING", "APPROVED", "REJECTED"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GuideApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<Application["status"]>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !hasAdminAccess(session.user)) {
      router.push("/login");
      return;
    }
    void fetchApplications();
  }, [session, status, router]);

  const fetchApplications = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setErrorMessage(null);
      const res = await fetch("/api/admin/applications", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setErrorMessage("Could not load guide applications.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredApplications = useMemo(
    () => applications.filter((application) => application.status === activeTab),
    [applications, activeTab]
  );

  const statusPillClass = (statusValue: Application["status"]) => {
    if (statusValue === "PENDING") return "bg-amber-100 text-amber-700";
    if (statusValue === "APPROVED") return "bg-emerald-100 text-emerald-700";
    return "bg-rose-100 text-rose-700";
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Guide Applications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and manage pending, approved, and rejected applications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchApplications(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#A18167] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span className="ml-2 text-xs opacity-80">
                {applications.filter((app) => app.status === tab).length}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Applicant</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Submitted</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-900">{application.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{application.email}</td>
                  <td className="px-4 py-3 text-slate-600" suppressHydrationWarning>
                    {formatDate(application.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClass(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/applications/${application.id}`}
                      className="inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {filteredApplications.map((application) => (
            <article key={`card-${application.id}`} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{application.fullName}</p>
                  <p className="text-xs text-slate-600 break-all">{application.email}</p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${statusPillClass(application.status)}`}>
                  {application.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-500" suppressHydrationWarning>
                  {formatDate(application.createdAt)}
                </p>
                <Link
                  href={`/admin/applications/${application.id}`}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Review
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            No applications in this status.
          </p>
        )}
      </section>
    </div>
  );
}
