import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user)
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword)
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );

    if (!user.is_verified)
      return NextResponse.json(
        {
          success: false,
          message: "Akun belum terverifikasi",
          needVerification: true,
        },
        { status: 403 }
      );

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { success: false, message: "Gagal melakukan login" },
      { status: 500 }
    );
  }
}
