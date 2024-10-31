"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginForm from "@/components/LoginForm";
import background from "../../../public/loginpic.jpg";

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      switch (session.user.role) {
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
          console.error("Unexpected user role:", session.user.role);
          router.push("/"); // Redirect to home page if role is unexpected
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader" />
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div>

      <section className="relative z-10 text-xl p-8 w-full max-w-lg">
        <div className="flex flex-col items-center justify-center mx-auto lg:py-0">
          <div className="w-full bg-white rounded-lg shadow-lg">
            <div className="p-6 space-y-4 sm:p-8">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white text-center">
                Sign in to your account
              </h1>
              <LoginForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
