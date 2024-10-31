"use client";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function info() {
  const router = useRouter();
  return (
    <div className="flex-grow bg-white p-28">
      <h2 className="text-3xl font-semibold text-center mb-28">
        Start your Guide Journey now
      </h2>
      <div className="flex justify-center items-center space-x-4 mb-20">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mb-2">
            <span className="text-2xl font-semibold">1</span>
          </div>
          <p className="text-lg">Sign up with us</p>
        </div>
        <ArrowRight className="text-gray-400 " />
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mb-2">
            <span className="text-2xl font-semibold">2</span>
          </div>
          <p className="text-lg">Verify your business</p>
        </div>
        <ArrowRight className="text-gray-400" />
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mb-2">
            <span className="text-2xl font-semibold">3</span>
          </div>
          <p className="text-lg">Become a guide</p>
        </div>
      </div>
      <div className="text-center">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded"
          onClick={() => {
            console.log("Button clicked");
            router.push("/guide/register-form");
          }}
        >
          Start your journey now
        </button>
      </div>
    </div>
  );
}
