// app/api/send-otp/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import * as SibApiV3Sdk from "@sendinblue/client";

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email, type = "register" } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Cek apakah user sudah ada
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, is_verified")
      .eq("email", trimmedEmail)
      .single();

    // Validasi berdasarkan type
    if (type === "register" && existingUser) {
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    if (type === "forgot" && !existingUser) {
      return NextResponse.json(
        { success: false, message: "Email tidak ditemukan" },
        { status: 404 }
      );
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 menit

    // Hapus OTP lama untuk email ini
    await supabase.from("otps").delete().eq("email", trimmedEmail);

    // Simpan OTP baru
    const { error: insertError } = await supabase.from("otps").insert({
      email: trimmedEmail,
      otp_code: otpCode,
      expires_at: expiresAt,
      used: false,
    });

    if (insertError) {
      throw insertError;
    }

    // Siapkan konten email
    const emailSubject =
      type === "register"
        ? "Kode Verifikasi Registrasi zoneTix"
        : "Kode Reset Password zoneTix";

    const emailContent =
      type === "register"
        ? `Kode OTP untuk registrasi zoneTix Anda adalah: ${otpCode}`
        : `Kode OTP untuk reset password zoneTix Anda adalah: ${otpCode}`;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #72BAA9; margin-bottom: 10px;">zoneTix</h1>
              <h2 style="color: #474E93; margin-bottom: 20px;">
                ${
                  type === "register"
                    ? "Verifikasi Registrasi"
                    : "Reset Password"
                }
              </h2>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <p style="margin-bottom: 15px;">Halo,</p>
              <p style="margin-bottom: 15px;">${emailContent}</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <div style="background-color: #72BAA9; color: white; font-size: 24px; font-weight: bold; padding: 15px; border-radius: 8px; letter-spacing: 3px; display: inline-block;">
                  ${otpCode}
                </div>
              </div>
              
              <p style="margin-bottom: 15px; color: #666;">
                Kode ini berlaku selama <strong>10 menit</strong>.
              </p>
              <p style="margin-bottom: 0; color: #666;">
                <strong>Jangan bagikan kode ini kepada siapa pun!</strong>
              </p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              <p>Email ini dikirim secara otomatis. Mohon jangan membalas email ini.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Kirim email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: trimmedEmail }];
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_SENDER_ADDRESS,
      name: process.env.EMAIL_SENDER_NAME,
    };
    sendSmtpEmail.subject = emailSubject;
    sendSmtpEmail.htmlContent = htmlContent;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return NextResponse.json({
      success: true,
      message: "OTP berhasil dikirim ke email Anda",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengirim OTP" },
      { status: 500 }
    );
  }
}
