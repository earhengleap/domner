import RegisterForm from "@/components/RegisterForm";
import Image from "next/image";
import React from "react";
import background from "../../../public/loginpic.jpg";

export default function Register() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      
        {/* Overlay for Readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        <section className="rrelative z-10 text-xl  p-8 w-full max-w-lg">
        {/* Content Container */}
        <div className="flex flex-col items-center justify-center   mx-auto lg:py-0">
          <div className="w-full bg-white rounded-lg shadow-2xl dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
                Create a new account
              </h1>
              <RegisterForm role="USER" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
