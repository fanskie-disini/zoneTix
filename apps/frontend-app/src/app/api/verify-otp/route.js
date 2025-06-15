import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, otp, userData, type = "register" } = await request.json();

    const { data: otpRecord } = await supabase
      .from("otps")
      .select("*")
      .eq("email", email)
      .eq("otp_code", otp)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!otpRecord)
      return NextResponse.json(
        { success: false, message: "OTP tidak valid atau sudah kadaluarsa" },
        { status: 400 }
      );

    await supabase.from("otps").update({ used: true }).eq("id", otpRecord.id);

    if (type === "register") {
      if (!userData)
        return NextResponse.json(
          { success: false, message: "Data user diperlukan untuk registrasi" },
          { status: 400 }
        );

      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const { data: newUser } = await supabase
        .from("users")
        .insert({
          email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          password_hash: hashedPassword,
          is_verified: true,
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        message: "Akun berhasil dibuat dan diverifikasi",
        user: {
          id: newUser.id,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "OTP valid, silakan buat password baru",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memverifikasi OTP" },
      { status: 500 }
    );
  }
}
