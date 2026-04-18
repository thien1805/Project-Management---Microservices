"use client";
import { motion } from "framer-motion";
import { Zap, Shield, MousePointerClick, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDF2F8] relative overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-200 via-pink-300 to-purple-400 opacity-50 blur-3xl -z-10" />

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">W</div>
          EasyWork
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#">Features</a>
          <a href="#">Changelog</a>
          <a href="#">Company</a>
          <a href="#">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium">Request demo</button>
          <button onClick={() => router.push("/login")} className="bg-white px-5 py-2 rounded-full text-sm font-bold shadow-sm">Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto text-center mt-20 px-4">
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="uppercase tracking-widest text-xs font-semibold mb-4"
        >
          The Future of Productivity Apps
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-7xl font-bold leading-tight mb-6"
        >
          Redefine the way you work, <br /> save hours each month
        </motion.h1>
        <p className="text-gray-600 text-lg mb-10">
          We will help you better organize your time, so you can focus on what matters to you.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl"
        >
          Sign up now - its free
        </motion.button>

        {/* Feature Cards Mockup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          {[
            { title: "Minimalistic elegance", icon: <Mail />, color: "bg-orange-100" },
            { title: "Advanced filtering", icon: <Zap />, color: "bg-pink-100" },
            { title: "Command your mails", icon: <Shield />, color: "bg-purple-100" },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className={`${item.color} p-6 rounded-3xl shadow-sm text-left border border-white/50`}
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <div className="h-20 bg-white/40 rounded-xl" />
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}