"use client";
import React from "react";
import RegisterForm from "@/components/RegisterForm";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Register() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      switch (session?.user?.role) {
        case "GUIDE":
          router.push("/guide-dashboard");
          break;
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/");
      }
    }
  }, [router, session, status]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fdfbf9]">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-4"
        >
          <Image
            src="/DomnerDesktop.png"
            alt="Domner Logo"
            width={80}
            height={80}
            className="opacity-80"
          />
        </motion.div>
        <div className="w-12 overflow-hidden rounded-full bg-brown-100 h-1">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="h-full w-full bg-[#A18167]"
          />
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Hero Background with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/loginpic.jpg"
          alt="Cambodia Background"
          fill
          className="object-cover scale-105"
          priority
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#292929]/80 via-[#292929]/40 to-transparent" />
        <div className="absolute inset-0 z-10 backdrop-blur-[2px]" />
      </div>

      {/* Main Content Card */}
      <motion.section
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-md px-6 py-12 mt-20 md:mt-24"
      >
        <div className="overflow-hidden rounded-[2.5rem] bg-[#fdfbf9]/95 shadow-2xl backdrop-blur-2xl border border-white/20">
          <div className="px-8 pt-10 pb-12 md:px-12">
            {/* Card Header & Branding */}
            <div className="mb-8 text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
              >
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-brown-100/20">
                  <Image
                    src="/DomnerDesktop.png"
                    alt="Domner Logo"
                    width={60}
                    height={60}
                    className="mx-auto"
                  />
                </div>
              </motion.div>
              
              <div className="space-y-1">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-black text-[#292929] tracking-tight"
                >
                  Create Account
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[#A18167] font-medium text-sm uppercase tracking-widest"
                >
                  Begin your authentic adventure
                </motion.p>
              </div>
            </div>

            {/* Registration Form */}
            <RegisterForm role="USER" />
          </div>
        </div>

        {/* Decorative Elements */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-xs font-bold uppercase tracking-[0.3em] text-white/70 drop-shadow-md"
        >
          &copy; {new Date().getFullYear()} Domner Platform. All rights reserved.
        </motion.p>
      </motion.section>
    </main>
  );
}
