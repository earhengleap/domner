"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>();

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to reset password.");
      }

      toast.success(payload?.message || "Password reset successful.");
      reset();
      router.push("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600 text-center">
          This reset link is invalid or missing. Request a new password reset
          email.
        </p>
        <Link
          href="/forgot-password"
          className="flex items-center justify-center gap-2 text-sm font-bold text-[#A18167] hover:text-[#8e6f56] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Forgot Password</span>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-[#A18167] ml-1"
        >
          New Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#A18167] transition-colors" />
          <Input
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            type="password"
            placeholder="Enter your new password"
            className="pl-12 bg-[#fdfbf9] border-brown-100/50 focus:border-[#A18167] focus:ring-[#A18167] h-12 rounded-xl transition-all"
          />
        </div>
        {errors.password && (
          <small className="text-red-500 text-xs ml-1 font-medium italic">
            * {errors.password.message}
          </small>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-semibold text-[#A18167] ml-1"
        >
          Confirm Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#A18167] transition-colors" />
          <Input
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            type="password"
            placeholder="Re-enter your new password"
            className="pl-12 bg-[#fdfbf9] border-brown-100/50 focus:border-[#A18167] focus:ring-[#A18167] h-12 rounded-xl transition-all"
          />
        </div>
        {errors.confirmPassword && (
          <small className="text-red-500 text-xs ml-1 font-medium italic">
            * {errors.confirmPassword.message}
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
            <span>Resetting...</span>
          </div>
        ) : (
          "Reset Password"
        )}
      </Button>

      <div className="pt-2">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm font-bold text-[#A18167] hover:text-[#8e6f56] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Login</span>
        </Link>
      </div>
    </form>
  );
}
