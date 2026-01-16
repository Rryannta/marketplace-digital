"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // --- LOGIC HANDLERS (SAMA) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("Gagal Masuk: " + error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: `https://ui-avatars.com/api/?name=${fullName}&background=random`,
        },
      },
    });
    if (error) {
      alert("Gagal Daftar: " + error.message);
    } else {
      alert("Sukses! Cek email kamu untuk konfirmasi.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });
    if (error) alert(error.message);
  };

  return (
    // Menggunakan 100dvh agar pas di layar browser HP
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 text-white selection:bg-purple-500/30">
      {/* --- ANIMATED AURORA BACKGROUND --- */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-[120px] opacity-40"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [-50, 50, -50], // Gerakan dikurangi sedikit agar tidak keluar layar HP
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-b from-blue-600 to-cyan-500 blur-[120px] opacity-30"
        />
      </div>

      {/* --- PREMIUM GLASS CARD --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        // Padding responsif: p-6 di HP, p-8 di Desktop
        className="relative z-10 w-full max-w-[420px] rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_40px_-10px_rgba(120,119,198,0.3)]"
      >
        <div className="mb-8 text-center">
          {/* Ukuran font responsif */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Access your digital marketplace powerhouse.
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-black/40 p-1 mb-8 border border-white/5">
            <TabsTrigger
              value="login"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black text-gray-400 transition-all duration-300"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black text-gray-400 transition-all duration-300"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="login"
            className="focus-visible:ring-0 focus-visible:outline-none"
          >
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 text-sm pl-1">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-300 text-sm pl-1"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold shadow-[0_0_25px_-5px_rgba(168,85,247,0.5)] transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Sign In to Account"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent
            value="register"
            className="focus-visible:ring-0 focus-visible:outline-none"
          >
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300 text-sm pl-1">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-all duration-300"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-email" className="text-gray-300 text-sm pl-1">
                  Email Address
                </Label>
                <Input
                  id="r-email"
                  type="email"
                  placeholder="john@example.com"
                  className="h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-pass" className="text-gray-300 text-sm pl-1">
                  Create Password
                </Label>
                <Input
                  id="r-pass"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold shadow-[0_0_25px_-5px_rgba(168,85,247,0.5)] transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* SOCIAL LOGIN */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-[#0a0a0a]/50 px-3 text-gray-500 backdrop-blur-sm">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="h-11 w-full rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white transition-all duration-300 group"
            >
              <svg
                className="mr-3 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.08-2.08 2.72-5.2 2.72-7.84 0-.76-.053-1.467-.173-2.16H12.48z" />
              </svg>
              Google
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
