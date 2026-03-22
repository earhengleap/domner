"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginForm from "@/components/LoginForm";
import background from "../../../public/loginpic.jpg";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      switch (session?.user?.role) {
        case "GUIDE":
          router.push("/guide-dashboard");
          break;
        case "USER":
          router.push("/");
          break;
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/");
      }
    }
  }, [session, status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#fdfbf9]">
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
        <div className="w-12 h-1 bg-brown-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-full h-full bg-[#A18167]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url(${background.src})` }}
      />
      
      {/* Sophisticated Gradients & Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#292929]/80 via-[#292929]/40 to-transparent"></div>
      <div className="absolute inset-0 z-10 backdrop-blur-[2px]"></div>

      {/* Main Content Card */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 w-full max-w-md px-6 py-12 mt-20 md:mt-24"
      >
        <div className="bg-[#fdfbf9]/95 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Brand Header */}
          <div className="pt-10 pb-6 px-10 text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
              <h1 className="text-3xl font-black text-[#292929] tracking-tight">
                Welcome Back
              </h1>
              <p className="text-[#A18167] font-medium text-sm">
                Explore the beauty of Cambodia
              </p>
            </div>
          </div>

          <div className="px-10 pb-12">
            <LoginForm />
          </div>
        </div>

        {/* Footer Polish */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-white/60 text-xs font-medium tracking-widest uppercase"
        >
          &copy; {new Date().getFullYear()} Domner Platform. All Rights Reserved.
        </motion.p>
      </motion.section>
    </div>
  );
}
