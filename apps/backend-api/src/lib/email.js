// src/lib/email.js
import { supabase } from "./supabase";

export async function sendApprovalEmail(email, eventTitle) {
  // Implementasi pengiriman email menggunakan service seperti Resend, SendGrid, dll.
  console.log(`Mengirim email approval ke ${email} untuk event ${eventTitle}`);
  
  // Contoh dengan Supabase Functions:
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: JSON.stringify({
      to: email,
      subject: `Event Anda "${eventTitle}" telah disetujui`,
      html: `<p>Event Anda "${eventTitle}" telah disetujui dan sekarang muncul di platform kami.</p>`
    })
  });
  
  if (error) {
    console.error("Error sending email:", error);
    return false;
  }
  
  return true;
}

export async function sendRejectionEmail(email, eventTitle, reason) {
  console.log(`Mengirim email rejection ke ${email} untuk event ${eventTitle}`);
  
  // Contoh dengan Supabase Functions:
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: JSON.stringify({
      to: email,
      subject: `Event Anda "${eventTitle}" memerlukan revisi`,
      html: `<p>Event Anda "${eventTitle}" tidak dapat disetujui karena: ${reason || 'Tidak disebutkan'}</p>
             <p>Silakan login ke akun Anda untuk mengedit dan mengajukan ulang event.</p>`
    })
  });
  
  if (error) {
    console.error("Error sending email:", error);
    return false;
  }
  
  return true;
}