"use client";

import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth"; // Import the auth hook
import {
  saveLoginData,
  clearLoginData,
  getSavedLoginData,
} from "@/utils/authStorage";

const Login = () => {
  const router = useRouter();
  const { login, user } = useAuth(); // Use auth hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const saved = getSavedLoginData();
    if (saved.rememberMe) {
      setEmail(saved.email);
      setPassword(saved.password);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Mohon isi semua field");
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Format email tidak valid");
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.success) {
        // Use auth hook login method instead of manual localStorage
        login(response.data.user, response.data.token);

        // Simpan data login jika remember me dicentang
        if (rememberMe) {
          saveLoginData(email, password);
        } else {
          clearLoginData();
        }

        toast.success("Berhasil masuk!");

        // Redirect ke dashboard atau halaman utama
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);

      if (
        error.response?.status === 403 &&
        error.response?.data?.needVerification
      ) {
        toast.error("Akun belum terverifikasi. Silakan cek email Anda.");
      } else {
        const errorMessage =
          error.response?.data?.message || "Gagal melakukan login";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setType(type === "password" ? "text" : "password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 pt-24">
      <motion.div
        className="relative w-full max-w-sm sm:max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Masuk ke <span className="text-[#72BAA9]">zoneTix</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Selamat datang kembali!
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Google Sign In Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-[#72BAA9] dark:hover:border-[#72BAA9] transition-all duration-200"
              disabled={isLoading}
            >
              <FcGoogle size={20} />
              Masuk dengan Google
            </button>

            {/* Divider */}
            <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 gap-4 text-sm">
              <hr className="flex-1 border-gray-300 dark:border-gray-600" />
              <span className="bg-white dark:bg-gray-800 px-3">atau</span>
              <hr className="flex-1 border-gray-300 dark:border-gray-600" />
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <input
                required
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Alamat Email"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />

              <div className="relative">
                <input
                  required
                  id="password"
                  name="password"
                  type={type}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleToggle}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {type === "password" ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      rememberMe
                        ? "bg-[#72BAA9] border-[#72BAA9]"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                  >
                    {rememberMe && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                  Ingat saya
                </span>
              </label>

              <Link
                href="/forgot"
                className="text-[#72BAA9] hover:text-[#474E93] font-semibold hover:underline transition-colors"
              >
                Lupa password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-[#72BAA9] to-[#474E93] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:from-[#5da89a] hover:to-[#3d4180] transform hover:scale-[1.02] hover:shadow-xl"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </div>
              ) : (
                "Masuk"
              )}
            </button>

            {/* Register Link */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-[#72BAA9] hover:text-[#474E93] font-semibold hover:underline transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
