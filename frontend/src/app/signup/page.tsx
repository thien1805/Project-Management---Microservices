"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(fullName.trim(), email.trim(), password);
      router.push("/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFF7ED] p-4 md:p-10">
      <div className="flex w-full max-w-6xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden">
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-white">
              <LayoutGrid />
            </div>
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-gray-400 text-sm">Bat dau voi workspace cua ban trong vai giay</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Full name"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 ring-orange-400"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 ring-orange-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 ring-orange-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition">
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>

            {error ? <p className="text-red-500 text-sm">{error}</p> : null}
          </form>

          <p className="mt-6 text-sm text-gray-500 text-center">
            Da co tai khoan?{" "}
            <Link href="/login" className="text-orange-600 font-semibold">
              Login
            </Link>
          </p>
        </div>

        <div className="hidden md:flex w-1/2 bg-[#FFEDD5] relative items-center justify-center overflow-hidden">
          <div className="text-center z-10 p-10">
            <h2 className="text-3xl font-bold mb-4">
              Build Projects <span className="text-orange-600">Nhanh Hon</span>
            </h2>
            <div className="relative w-64 h-64 mx-auto my-10 flex items-center justify-center">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                className="absolute w-full h-full border border-orange-200 rounded-full"
              />
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                P
              </div>
            </div>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Sign up de tao project, task, va theo doi thong bao real-time theo luong microservice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
