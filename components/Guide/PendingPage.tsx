"use client";
import React from 'react';
import Link from 'next/link';

const GuidePendingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Application Submitted</h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for submitting your guide application. Your application is currently under review.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <p className="text-center text-sm text-gray-500">
            We will notify you via email once your application has been processed.
          </p>
          <div className="rounded-md shadow">
            <Link href="/" className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePendingPage;
