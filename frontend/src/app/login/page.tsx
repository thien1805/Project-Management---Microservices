"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Chrome, Apple, Github, LayoutGrid } from "lucide-react";
import { useAuth } from "@/providers/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, pass);
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4FF] p-4 md:p-10">
      <div className="flex w-full max-w-6xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden">
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-8 text-center">
             <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center text-white">
                <LayoutGrid />
             </div>
             <h2 className="text-2xl font-bold">Login to your account!</h2>
             <p className="text-gray-400 text-sm">Enter your registered email and password to login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input 
                type="email" placeholder="eg. pixelcot@gmail.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 ring-blue-500"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input 
                type="password" placeholder="*************"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 ring-blue-500"
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-blue-600">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <a href="#">Forgot Password?</a>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
              Login
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest">Or login with</p>
            <div className="flex justify-center gap-4">
               {[Chrome, Apple, Github].map((Icon, i) => (
                 <button key={i} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                   <Icon className="w-5 h-5" />
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Right Side: Visuals */}
        <div className="hidden md:flex w-1/2 bg-[#D1E3FF] relative items-center justify-center overflow-hidden">
          <div className="text-center z-10 p-10">
            <h2 className="text-3xl font-bold mb-4">Write Better <span className="text-blue-600">Everywhere</span></h2>
            
            {/* Orbital Animation Placeholder */}
            <div className="relative w-64 h-64 mx-auto my-10 flex items-center justify-center">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                 className="absolute w-full h-full border border-blue-200 rounded-full"
               />
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">P</div>
            </div>

            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Compatible with Gmail, Outlook, LinkedIn and most web editors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}