import StartYourGuide from "@/components/Guide/StartYourGuide";

import React from "react";

export default async function page() {
  
  return (
    <>
      <div className="flex flex-col min-h-screen py-16">
        {/* Hero Section */}
        <div
          className="relative h-96 bg-cover bg-center "
          style={{ backgroundImage: "url('/loginpic.jpg')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-start p-8">
            <img
              src="/DomnerDesktop.png"
              alt="Domner logo"
              width={220}
              height={220}
              className="mb-4"
            />
            <h1 className="text-white text-4xl font-bold mb-4">
              Start your guide journey now with Domner
            </h1>
            <p className="text-white text-xl mb-6">
              With just one click you can start your guide journey immediately
            </p>
            <button className="bg-green-600 text-white px-6 py-2 rounded">
              Get started
            </button>
          </div>
        </div>
        <StartYourGuide/>
      </div>
    </>
  );
}
