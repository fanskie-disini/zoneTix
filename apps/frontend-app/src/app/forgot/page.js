"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Mohon masukkan alamat email Anda");
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          type: "forgot",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Kode OTP telah dikirim ke email Anda!");
        setStep(2);
      } else {
        toast.error(data.message || "Gagal mengirim OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      return toast.error("Mohon masukkan kode OTP yang valid (6 digit)");
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
          type: "forgot",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("OTP berhasil diverifikasi!");
        setStep(3);
      } else {
        toast.error(data.message || "OTP tidak valid atau sudah kadaluarsa");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      return toast.error("Password minimal 6 karakter");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Konfirmasi password tidak cocok");
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          newPassword,
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password berhasil direset!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Gagal mereset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          type: "forgot",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Kode OTP baru telah dikirim!");
      } else {
        toast.error(data.message || "Gagal mengirim ulang OTP");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#72BAA9] to-[#474E93] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🔐</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Lupa Password?
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Masukkan email Anda untuk menerima kode OTP
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <input
                  id="email"
                  type="email"
                  placeholder="Alamat Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200"
                  required
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
                    Mengirim...
                  </div>
                ) : (
                  "Kirim Kode OTP"
                )}
              </button>
            </form>
          </>
        );

      case 2:
        return (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#72BAA9] to-[#474E93] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">✉️</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Verifikasi Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Masukkan kode OTP yang telah dikirim ke
              </p>
              <p className="text-[#72BAA9] font-semibold">{email}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <input
                  id="otp"
                  type="text"
                  placeholder="Masukkan 6 digit kode OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest"
                  maxLength="6"
                  required
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

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Tidak menerima kode?
                </p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-[#72BAA9] hover:text-[#474E93] font-semibold hover:underline transition-colors disabled:opacity-50"
                >
                  Kirim ulang OTP
                </button>
              </div>
            </form>
          </>
        );

      case 3:
        return (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#72BAA9] to-[#474E93] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🔑</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Password Baru
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Buat password baru untuk akun Anda
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Password Baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200"
                  minLength="6"
                  required
                />
              </div>

              <div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Konfirmasi Password Baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] focus:border-transparent transition-all duration-200"
                  minLength="6"
                  required
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
                    Mereset Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        );

      default:
        return null;
    }
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
          {renderStepContent()}

          {/* Progress Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step >= stepNum
                    ? "bg-[#72BAA9]"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Back to Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ingat password Anda?{" "}
              <Link
                href="/login"
                className="text-[#72BAA9] hover:text-[#474E93] font-semibold hover:underline transition-colors"
              >
                Kembali ke halaman masuk
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
