// app/api/reset-password/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, newPassword, otp } = await request.json();

    if (!email || !newPassword || !otp) {
      return NextResponse.json(
        { success: false, message: "Semua field diperlukan" },
        { status: 400 }
      );
    }

    // Cek apakah OTP sudah diverifikasi (used: true) dan masih dalam waktu 15 menit
    const { data: otpRecord } = await supabase
      .from("otps")
      .select("*")
      .eq("email", email)
      .eq("otp_code", otp)
      .eq("used", true)
      .gt("expires_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
      .single();

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi reset password tidak valid atau sudah kadaluarsa",
        },
        { status: 400 }
      );
    }

    // Cek apakah user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("email", email);

    if (updateError) {
      throw updateError;
    }

    // Hapus semua OTP untuk email ini setelah berhasil reset password
    await supabase.from("otps").delete().eq("email", email);

    return NextResponse.json({
      success: true,
      message: "Password berhasil direset",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mereset password" },
      { status: 500 }
    );
  }
}
