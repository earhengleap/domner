"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  Github, 
  Chrome 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterForm({ role }: any) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState("");

  async function onSubmit(data: any) {
    try {
      data.role = role || "USER";
      setLoading(true);
      setEmailErr("");
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        setLoading(false);
        toast.success("Account Created Successfully!");
        reset();
        router.push("/login");
      } else {
        setLoading(false);
        if (response.status === 409) {
          setEmailErr("This email is already registered");
          toast.error("User with this Email already exists");
        } else {
          toast.error(responseData?.message || "Oops! Something went wrong");
        }
      }
    } catch (error) {
      setLoading(false); 
      toast.error("Network error. Please try again.");
    }
  }

  const inputVariants = {
    focus: { scale: 1.01, transition: { duration: 0.2 } },
    hover: { x: 5, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#A18167] ml-1">Full Name</label>
          <motion.div whileHover="hover" variants={inputVariants} className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#A18167] transition-colors" />
            <Input
              {...register("name", { required: "Name is required" })}
              type="text"
              placeholder="Full Name"
              className="pl-12 bg-[#fdfbf9] border-brown-100/50 focus:border-[#A18167] focus:ring-[#A18167] h-12 rounded-xl transition-all"
            />
          </motion.div>
          <AnimatePresence>
            {errors.name && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-red-500 text-xs mt-1 ml-1 font-medium italic"
              >
                * {errors.name.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#A18167] ml-1">Email Address</label>
          <motion.div whileHover="hover" variants={inputVariants} className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#A18167] transition-colors" />
            <Input
              {...register("email", { required: "Email is required" })}
              type="email"
              placeholder="name@example.com"
              className="pl-12 bg-[#fdfbf9] border-brown-100/50 focus:border-[#A18167] focus:ring-[#A18167] h-12 rounded-xl transition-all"
            />
          </motion.div>
          <AnimatePresence>
            {(errors.email || emailErr) && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-red-500 text-xs mt-1 ml-1 font-medium italic"
              >
                * {(errors.email?.message as string) || emailErr}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#A18167] ml-1">Password</label>
          <motion.div whileHover="hover" variants={inputVariants} className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#A18167] transition-colors" />
            <Input
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 8, message: "Minimum 8 characters" }
              })}
              type="password"
              placeholder="••••••••"
              className="pl-12 bg-[#fdfbf9] border-brown-100/50 focus:border-[#A18167] focus:ring-[#A18167] h-12 rounded-xl transition-all"
            />
          </motion.div>
          <AnimatePresence>
            {errors.password && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-red-500 text-xs mt-1 ml-1 font-medium italic"
              >
                * {errors.password.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#A18167] hover:bg-[#8e6f56] text-white h-12 text-lg font-bold rounded-xl shadow-lg shadow-brown-200/50 transition-all active:scale-[0.98] disabled:opacity-70 group"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Joining...</span>
            </div>
          ) : (
            "Join Domner"
          )}
        </Button>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-brown-100/30"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
            OR CONTINUE WITH
          </span>
          <div className="flex-grow border-t border-brown-100/30"></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("google")}
            className="h-12 border-brown-100/50 hover:bg-[#fdfbf9] rounded-xl font-semibold flex items-center justify-center gap-3 transition-all group"
          >
            <Chrome className="w-5 h-5 text-[#EA4335] group-hover:scale-110 transition-transform" />
            <span className="text-[#292929]">Google</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("github")}
            className="h-12 border-brown-100/50 hover:bg-[#fdfbf9] rounded-xl font-semibold flex items-center justify-center gap-3 transition-all group"
          >
            <Github className="w-5 h-5 text-[#24292F] group-hover:scale-110 transition-transform" />
            <span className="text-[#292929]">GitHub</span>
          </Button>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-500 pt-2">
          Already a member?{" "}
          <Link
            href="/login"
            className="font-bold text-[#A18167] hover:text-[#8e6f56] transition-colors decoration-2 underline-offset-4 hover:underline"
          >
            Log in here
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
