// app/admin/applications/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

export default function ApplicationDetail() {
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/login");
    } else {
      fetchApplication();
    }
  }, [session, status, router, id]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`);
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
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader" />
      </div>
    );
  }

  const statusColors = {
    PENDING: "bg-yellow-100 border-yellow-300 text-yellow-800",
    APPROVED: "bg-green-100 border-green-300 text-green-800",
    REJECTED: "bg-red-100 border-red-300 text-red-800",
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div
          className={`px-6 py-4 border-l-4 ${statusColors[application.status]}`}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Application Detail
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                statusColors[application.status]
              }`}
            >
              {application.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {application.emailAddress}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(application).map(([key, value]) => {
              if (
                typeof value === "object" ||
                key === "id" ||
                key === "userId" ||
                key.endsWith("Url")
              )
                return null;
              return (
                <div key={key} className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {key.includes("Date") ? (
                      new Date(value as string).toLocaleDateString()
                    ) : key === "facebookLink" && value ? (
                      <a
                        href={value as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {value as string}
                      </a>
                    ) : Array.isArray(value) ? (
                      value.join(", ")
                    ) : (
                      (value as string)
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {application.nationalIdPassportUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    National ID/Passport
                  </p>
                  <Image
                    src={application.nationalIdPassportUrl}
                    alt="National ID/Passport"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              )}
              {application.guideCertificationUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Guide Certification
                  </p>
                  <Image
                    src={application.guideCertificationUrl}
                    alt="Guide Certification"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {application.status === "PENDING" ? (
            <div className="flex justify-between items-center">
              <Link
                href="/admin/pending-applications"
                className="text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Applications
              </Link>
              <div className="space-x-4">
                <button
                  onClick={() => handleStatusUpdate("REJECTED")}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate("APPROVED")}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Approve
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <Link
                href="/admin/applications"
                className="text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Applications
              </Link>
              <p className="text-sm text-gray-500">
                This application has been {application.status.toLowerCase()}. No
                further action is required.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
