// app/api/send-ticket/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import * as SibApiV3Sdk from "@sendinblue/client";

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// Fungsi untuk generate QR Code sebagai base64
function generateQRCodeDataURL(text, size = 200) {
  // Implementasi sederhana QR code pattern untuk demo
  // Dalam produksi, gunakan library QR code yang proper
  const canvas = {
    width: size,
    height: size,
    toDataURL: () => {
      // Simulasi QR code pattern sebagai base64
      const gridSize = 20;
      let pattern = "";
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          pattern += (i + j + text.length) % 3 === 0 ? "█" : "░";
        }
        pattern += "\n";
      }
      // Return placeholder base64 untuk QR code
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    },
  };
  return canvas.toDataURL();
}

export async function POST(request) {
  try {
    const ticketData = await request.json();

    // Validasi data yang diperlukan
    if (!ticketData.user?.email) {
      return NextResponse.json(
        { success: false, message: "Email penerima diperlukan" },
        { status: 400 }
      );
    }

    if (!ticketData.orderId || !ticketData.eTicketId) {
      return NextResponse.json(
        { success: false, message: "Data tiket tidak lengkap" },
        { status: 400 }
      );
    }

    const { orderId, eTicketId, event, user, tickets, total, purchaseDate } =
      ticketData;

    const trimmedEmail = user.email.toLowerCase().trim();

    // Format tanggal pembelian
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Generate QR Code untuk e-ticket
    const qrCodeDataURL = generateQRCodeDataURL(eTicketId);

    // Buat daftar tiket dalam HTML
    const ticketListHTML = tickets
      .map(
        (ticket) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${
          ticket.name
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
          ticket.quantity
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rp. ${ticket.subtotal.toLocaleString(
          "id-ID"
        )}</td>
      </tr>
    `
      )
      .join("");

    // HTML content untuk email
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #474E93 0%, #72BAA9 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">zoneTix</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">E-TICKET DIGITAL</p>
            </div>
            
            <!-- Konfirmasi Pembelian -->
            <div style="padding: 30px 20px; text-align: center; background-color: #f8f9fc;">
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h2 style="color: #155724; margin: 0 0 10px 0; font-size: 24px;">✅ Pembayaran Berhasil!</h2>
                <p style="color: #155724; margin: 0; font-size: 16px;">Terima kasih atas pembelian tiket Anda</p>
              </div>
            </div>
            
            <!-- Detail Pesanan -->
            <div style="padding: 0 20px 30px 20px;">
              <div style="background-color: #ffffff; border: 2px solid #72BAA9; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h3 style="color: #474E93; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #72BAA9; padding-bottom: 10px;">📋 DETAIL PESANAN</h3>
                
                <!-- Info Pesanan -->
                <div style="margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #474E93;">ID Pesanan:</td>
                      <td style="padding: 8px 0; text-align: right;">${orderId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #474E93;">ID E-Ticket:</td>
                      <td style="padding: 8px 0; text-align: right;">${eTicketId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #474E93;">Tanggal Pembelian:</td>
                      <td style="padding: 8px 0; text-align: right;">${formatDate(
                        purchaseDate
                      )}</td>
                    </tr>
                  </table>
                </div>

                <!-- Info Event -->
                <div style="background-color: #f8f9fc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h4 style="color: #474E93; margin: 0 0 15px 0; font-size: 18px;">🎪 ${
                    event.title
                  }</h4>
                  <p style="margin: 5px 0; color: #666;"><strong>📅 Tanggal:</strong> ${
                    event.date
                  }</p>
                  <p style="margin: 5px 0; color: #666;"><strong>📍 Lokasi:</strong> ${
                    event.location
                  }</p>
                </div>

                <!-- Detail Tiket -->
                <div style="margin-bottom: 20px;">
                  <h4 style="color: #474E93; margin: 0 0 15px 0; font-size: 16px;">🎫 Detail Tiket:</h4>
                  <table style="width: 100%; border-collapse: collapse; background-color: #fff;">
                    <thead>
                      <tr style="background-color: #72BAA9; color: white;">
                        <th style="padding: 12px; text-align: left;">Jenis Tiket</th>
                        <th style="padding: 12px; text-align: center;">Qty</th>
                        <th style="padding: 12px; text-align: right;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${ticketListHTML}
                    </tbody>
                    <tfoot>
                      <tr style="background-color: #7E5CAD; color: white; font-weight: bold;">
                        <td style="padding: 15px;" colspan="2">TOTAL PEMBAYARAN</td>
                        <td style="padding: 15px; text-align: right; font-size: 18px;">Rp. ${total.toLocaleString(
                          "id-ID"
                        )}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <!-- QR Code E-Ticket -->
              <div style="background-color: #ffffff; border: 3px dashed #72BAA9; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px;">
                <h3 style="color: #474E93; margin: 0 0 20px 0; font-size: 20px;">🎫 E-TICKET QR CODE</h3>
                
                <!-- QR Code Placeholder -->
                <div style="background-color: #f8f9fc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <div style="width: 200px; height: 200px; margin: 0 auto; background-color: #000; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                    <div style="color: white; font-family: monospace; font-size: 8px; line-height: 1; text-align: center; word-break: break-all;">
                      ${eTicketId}
                    </div>
                  </div>
                </div>

                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                  <p style="margin: 0; color: #856404; font-weight: bold;">⚠️ PENTING!</p>
                  <p style="margin: 5px 0 0 0; color: #856404;">Tunjukkan QR code ini saat masuk event</p>
                </div>

                <p style="color: #666; margin: 0; font-size: 14px;">
                  Simpan email ini atau screenshot QR code untuk akses masuk event
                </p>
              </div>

              <!-- Info Pemesan -->
              <div style="background-color: #f8f9fc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h4 style="color: #474E93; margin: 0 0 15px 0; font-size: 16px;">👤 Informasi Pemesan:</h4>
                <p style="margin: 5px 0; color: #666;"><strong>Nama:</strong> ${
                  user.name
                }</p>
                <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${
                  user.email
                }</p>
                <p style="margin: 5px 0; color: #666;"><strong>Telepon:</strong> ${
                  user.phone
                }</p>
              </div>

              <!-- Instruksi -->
              <div style="background-color: #e7f3ff; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px;">
                <h4 style="color: #0c5460; margin: 0 0 15px 0; font-size: 16px;">📝 Instruksi Penting:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
                  <li style="margin-bottom: 8px;">Datang 30 menit sebelum acara dimulai</li>
                  <li style="margin-bottom: 8px;">Tunjukkan QR code ini atau ID E-Ticket saat masuk</li>
                  <li style="margin-bottom: 8px;">Bawa identitas diri yang valid</li>
                  <li style="margin-bottom: 8px;">E-ticket tidak dapat dipindahtangankan</li>
                  <li style="margin-bottom: 0;">Hubungi customer service jika ada kendala</li>
                </ul>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #474E93; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">zoneTix - Sistem Tiket Digital</p>
              <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                Email ini dikirim secara otomatis. Mohon jangan membalas email ini.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
                © ${new Date().getFullYear()} zoneTix. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Kirim email menggunakan Brevo (SendinBlue)
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: trimmedEmail, name: user.name }];
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_SENDER_ADDRESS,
      name: process.env.EMAIL_SENDER_NAME,
    };
    sendSmtpEmail.subject = `E-Ticket zoneTix - ${event.title} [${eTicketId}]`;
    sendSmtpEmail.htmlContent = htmlContent;

    // Optional: Tambahkan attachment PDF jika diperlukan
    // sendSmtpEmail.attachment = [{ ... }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Optional: Simpan log pengiriman e-ticket ke database
    try {
      await supabase.from("ticket_emails").insert({
        order_id: orderId,
        eticket_id: eTicketId,
        email: trimmedEmail,
        sent_at: new Date().toISOString(),
        event_title: event.title,
        total_amount: total,
      });
    } catch (logError) {
      console.warn("Warning: Failed to log email sending:", logError);
      // Tidak perlu menggagalkan proses jika logging gagal
    }

    return NextResponse.json({
      success: true,
      message: `E-ticket berhasil dikirim ke ${trimmedEmail}`,
      data: {
        orderId,
        eTicketId,
        sentTo: trimmedEmail,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error sending e-ticket:", error);

    // Handle specific Brevo API errors
    if (error.response) {
      const errorMessage =
        error.response.body?.message || "Gagal mengirim email";
      return NextResponse.json(
        { success: false, message: `Email error: ${errorMessage}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal mengirim e-ticket ke email" },
      { status: 500 }
    );
  }
}
