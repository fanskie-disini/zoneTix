"use client";

import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";

const Register = () => {
  const router = useRouter();
  const [type, setType] = useState({
    password: "password",
    confirmPassword: "password",
  });

  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = e.target;
    const emailInput = form.email.value.trim();
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // Validasi
    if (
      !emailInput ||
      !firstName ||
      !lastName ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return toast.error("Mohon lengkapi semua field");
    }

    if (password !== confirmPassword) {
      return toast.error("Konfirmasi password tidak sesuai");
    }

    if (password.length < 6) {
      return toast.error("Password minimal 6 karakter");
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      return toast.error("Format email tidak valid");
    }

    // Validasi nomor telepon (hanya angka)
    if (!/^\d+$/.test(phone)) {
      return toast.error("Nomor telepon hanya boleh berisi angka");
    }

    setIsLoading(true);

    try {
      // Simpan data user untuk verifikasi OTP nanti
      setEmail(emailInput);
      setUserData({
        firstName,
        lastName,
        phone,
        password,
      });

      // Kirim OTP ke email
      const res = await axios.post("/api/send-otp", {
        email: emailInput,
        type: "register",
      });

      if (res.data.success) {
        toast.success("Kode OTP telah dikirim ke email Anda");
        setShowOTP(true);
      } else {
        toast.error(res.data.message || "Gagal mengirim OTP");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      const errorMessage =
        err.response?.data?.message || "Server error saat mengirim OTP";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      return toast.error("Mohon masukkan kode OTP 6 digit");
    }

    setIsLoading(true);

    try {
      const res = await axios.post("/api/verify-otp", {
        email,
        otp,
        userData,
        type: "register",
      });

      if (res.data.success) {
        toast.success("Akun berhasil dibuat dan diverifikasi!");

        // Redirect ke halaman login setelah berhasil
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast.error(res.data.message || "Kode OTP tidak valid");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      const errorMessage = err.response?.data?.message || "Verifikasi gagal";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await axios.post("/api/send-otp", {
        email,
        type: "register",
      });

      if (res.data.success) {
        toast.success("Kode OTP baru telah dikirim");
      } else {
        toast.error("Gagal mengirim ulang OTP");
      }
    } catch (err) {
      toast.error("Gagal mengirim ulang OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (field) => {
    setType((prev) => ({
      ...prev,
      [field]: prev[field] === "password" ? "text" : "password",
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 pt-24">
      {!showOTP ? (
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
                Bergabung dengan <span className="text-[#72BAA9]">zoneTix</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Buat akun dan nikmati event terbaik
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Google Sign Up Button */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-[#72BAA9] dark:hover:border-[#72BAA9] transition-all duration-200"
                disabled={isLoading}
              >
                <FcGoogle size={20} />
                Daftar dengan Google
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
                  name="email"
                  type="email"
                  placeholder="Alamat Email"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200"
                  required
                  disabled={isLoading}
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="firstName"
                    placeholder="Nama Depan"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200"
                    required
                    disabled={isLoading}
                  />
                  <input
                    name="lastName"
                    placeholder="Nama Belakang"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-[#72BAA9] focus-within:border-transparent transition-all duration-200">
                  <span className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium border-r border-gray-300 dark:border-gray-600">
                    +62
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="8211234567"
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="relative">
                  <input
                    name="password"
                    type={type.password}
                    placeholder="Password (minimal 6 karakter)"
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200"
                    required
                    minLength="6"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => handleToggle("password")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    {type.password === "password" ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={type.confirmPassword}
                    placeholder="Konfirmasi Password"
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => handleToggle("confirmPassword")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    {type.confirmPassword === "password" ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
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
                  "Buat Akun"
                )}
              </button>

              {/* Login Link */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-[#72BAA9] hover:text-[#474E93] font-semibold hover:underline transition-colors"
                >
                  Masuk di sini
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="relative w-full max-w-sm sm:max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#72BAA9] to-[#474E93] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifikasi OTP
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Kami telah mengirim kode OTP ke email Anda
              </p>
              <p className="text-sm text-[#72BAA9] font-medium mt-1">{email}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Masukkan kode OTP"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200 text-center text-lg font-mono tracking-widest"
                  maxLength="6"
                  disabled={isLoading}
                />
              </div>

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
                    Memverifikasi...
                  </div>
                ) : (
                  "Verifikasi OTP"
                )}
              </button>

              {/* Resend Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tidak menerima kode?{" "}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-[#72BAA9] hover:text-[#474E93] font-semibold hover:underline transition-colors disabled:opacity-50"
                  >
                    Kirim ulang
                  </button>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Register;
