"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      const loginData = await signIn("credentials", {
        ...data,
        redirect: false,
        callbackUrl: "/",
      });
      if (loginData?.error) {
        setLoading(false);
        toast.error("Sign-in error: Check your credentials");
      } else {
        // Sign-in was successful
        toast.success("Login Successful");
        reset();
        router.replace(loginData?.url || "/");
        router.refresh();
      }
    } catch (error) {
      setLoading(false);
      toast.error("Its seems something is wrong with your Network");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-[#A18167] ml-1"
          >
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#A18167] transition-colors" />
            <Input
              {...register("email", { required: true })}
              type="email"
              placeholder="name@example.com"
              className="pl-12 bg-[#fdfbf9] border-brown-100/50 focus:border-[#A18167] focus:ring-[#A18167] h-12 rounded-xl transition-all"
            />
          </div>
          {errors.email && (
            <small className="text-red-500 text-xs ml-1 font-medium italic">
              * Email is required
            </small>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-[#A18167]"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-xs font-semibold text-[#A18167] hover:text-[#8e6f56] transition-colors"
            >
              Forgot password
            </button>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#A18167] transition-colors" />
            <Input
              {...register("password", { required: true })}
              type="password"
              placeholder="••••••••"
              className="pl-12 bg-[#fdfbf9] border-brown-100/50 focus:border-[#A18167] focus:ring-[#A18167] h-12 rounded-xl transition-all"
            />
          </div>
          {errors.password && (
            <small className="text-red-500 text-xs ml-1 font-medium italic">
              * Password is required
            </small>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#A18167] hover:bg-[#8e6f56] text-white h-12 text-lg font-bold rounded-xl shadow-lg shadow-brown-200/50 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-brown-100/30"></div>
        <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          OR CONTINUE WITH
        </span>
        <div className="flex-grow border-t border-brown-100/30"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="h-12 border-brown-100/50 hover:bg-[#fdfbf9] rounded-xl font-semibold flex items-center justify-center gap-3 transition-all"
        >
          <FaGoogle className="text-[#EA4335] w-5 h-5" />
          <span>Google</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="h-12 border-brown-100/50 hover:bg-[#fdfbf9] rounded-xl font-semibold flex items-center justify-center gap-3 transition-all"
        >
          <FaGithub className="text-[#24292F] w-5 h-5" />
          <span>Github</span>
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-[#A18167] hover:text-[#8e6f56] transition-colors decoration-2 underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
