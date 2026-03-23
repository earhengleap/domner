"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ email: string }>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: { email: string }) {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to send reset link.");
      }

      toast.success(
        payload?.message || "If your account exists, a reset link has been sent."
      );
      reset();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to send reset link. Please try again.";
      toast.error(message);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-xl font-bold text-[#292929]">Forgot Password?</h2>
        <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

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
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              type="email"
              placeholder="name@example.com"
              className="pl-12 bg-[#fdfbf9] border-brown-100/50 focus:border-[#A18167] focus:ring-[#A18167] h-12 rounded-xl transition-all"
            />
          </div>
          {errors.email && (
            <small className="text-red-500 text-xs ml-1 font-medium italic">
              * {(errors.email as any).message}
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
              <span>Sending...</span>
            </div>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <div className="pt-2">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm font-bold text-[#A18167] hover:text-[#8e6f56] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Login</span>
        </Link>
      </div>
    </motion.div>
  );
}
