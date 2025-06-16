// src/app/eticket/[id]/page.jsx - Enhanced Version
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Download, Calendar, MapPin, User, Phone, Mail, Clock, ArrowLeft, X, Share2, Printer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ETicketPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      try {
        let storedTickets = {};
        
        // Coba ambil dari localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = localStorage.getItem('etickets');
          if (stored) {
            storedTickets = JSON.parse(stored);
          }
        }
        
        // Cek apakah data untuk ID ini ada
        if (storedTickets[id]) {
          setTicketData(storedTickets[id]);
        } else {
          // Jika tidak ada data, tampilkan error
          setError('E-ticket tidak ditemukan. Pastikan Anda telah menyelesaikan pembelian tiket.');
        }
      } catch (err) {
        console.error('Error loading ticket data:', err);
        setError('Gagal memuat data e-ticket');
      } finally {
        setLoading(false);
      }
    } else {
      setError('ID e-ticket tidak valid');
      setLoading(false);
    }
  }, [id]);

  // Generate consistent QR code pattern berdasarkan ticket ID
  const generateQRPattern = (text, gridSize = 12) => {
    const pattern = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      // Create deterministic pattern based on text and position
      const hash = (text.charCodeAt(i % text.length) + i) % 7;
      pattern.push(hash < 3);
    }
    return pattern;
  };

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Colors matching the design
      const primaryColor = [71, 78, 147]; // #474E93
      const secondaryColor = [114, 186, 169]; // #72BAA9
      const accentColor = [126, 92, 173]; // #7E5CAD

      // Header with gradient effect
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("zoneTix E-TICKET", pageWidth / 2, 25, { align: "center" });

      // Event Title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(ticketData?.event?.title || "Event Title", 20, 60);

      // Event Details
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const eventDate = ticketData?.event?.date ? 
        new Date(ticketData.event.date).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Tanggal Event';
      
      doc.text(`Tanggal: ${eventDate}`, 20, 75);
      doc.text(`Lokasi: ${ticketData?.event?.location || 'Lokasi Event'}`, 20, 87);

      // Ticket Details Box
      doc.setFillColor(248, 249, 252);
      doc.rect(20, 100, pageWidth - 40, 60, "F");
      doc.setDrawColor(...primaryColor);
      doc.rect(20, 100, pageWidth - 40, 60, "D");

      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DETAIL TIKET", 25, 115);

      let yPos = 125;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      if (ticketData?.tickets) {
        ticketData.tickets.forEach((ticket) => {
          doc.text(
            `${ticket.name} x${ticket.quantity} - Rp. ${ticket.subtotal?.toLocaleString() || '0'}`,
            25,
            yPos
          );
          yPos += 10;
        });
      }

      // Total
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accentColor);
      doc.text(`TOTAL: Rp. ${ticketData?.total?.toLocaleString() || '0'}`, 25, yPos + 5);

      // Order Information
      yPos += 25;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMASI PESANAN", 20, yPos);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`ID Pesanan: ${ticketData?.orderId || 'N/A'}`, 20, yPos + 15);
      doc.text(`ID E-Ticket: ${ticketData?.id || id}`, 20, yPos + 27);
      doc.text(`Nama Pemesan: ${ticketData?.user?.name || 'N/A'}`, 20, yPos + 39);
      doc.text(`Email: ${ticketData?.user?.email || 'N/A'}`, 20, yPos + 51);
      doc.text(`Telepon: ${ticketData?.user?.phone || 'N/A'}`, 20, yPos + 63);

      // QR Code placeholder
      doc.setFillColor(0, 0, 0);
      doc.rect(pageWidth - 80, yPos + 10, 60, 60, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("QR CODE", pageWidth - 50, yPos + 40, { align: "center" });
      doc.text(ticketData?.id || id, pageWidth - 50, yPos + 50, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.text("Scan QR Code saat masuk event", pageWidth - 80, yPos + 80);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Dicetak pada: ${new Date().toLocaleString("id-ID")}`,
        20,
        pageHeight - 20
      );
      doc.text(
        "zoneTix - Sistem Tiket Digital",
        pageWidth - 20,
        pageHeight - 20,
        { align: "right" }
      );

      // Save PDF
      doc.save(`e-ticket-${ticketData?.id || id}.pdf`);
      alert('E-ticket berhasil diunduh!');
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal mengunduh PDF. Pastikan browser Anda mendukung fitur ini.");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const shareTicket = async () => {
    const shareData = {
      title: `E-Ticket: ${ticketData?.event?.title || 'Event'}`,
      text: `Saya akan menghadiri ${ticketData?.event?.title || 'event ini'} pada ${formatDateTime(ticketData?.event?.date)}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link e-ticket berhasil disalin ke clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Manual fallback
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link e-ticket berhasil disalin ke clipboard!');
    }
  };

  const printTicket = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#474E93] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat e-ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              E-Ticket Tidak Ditemukan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'ID e-ticket tidak valid atau tidak ditemukan'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#474E93] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#3c417d] transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft size={20} />
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  const qrPattern = generateQRPattern(ticketData.id || id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 mt-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#474E93] to-[#72BAA9] text-white rounded-t-2xl p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle size={32} className="mr-2" />
            <h1 className="text-2xl font-bold">zoneTix E-Ticket</h1>
          </div>
          <p className="text-white/80">Tiket Digital Terverifikasi</p>
        </div>

        {/* Ticket Content */}
        <div className="bg-white dark:bg-gray-800 shadow-xl">
          {/* Status */}
          <div className="px-6 py-4 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-300 font-semibold">
                Tiket Dikonfirmasi
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-[#474E93] dark:text-blue-400 mb-4">
              {ticketData.event?.title || 'Event Title'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start text-gray-700 dark:text-gray-300">
                <Calendar size={18} className="mr-3 text-[#72BAA9] mt-1" />
                <div>
                  <p className="font-semibold">Tanggal Event</p>
                  <p className="text-sm">{formatDateTime(ticketData.event?.date)}</p>
                </div>
              </div>
              <div className="flex items-start text-gray-700 dark:text-gray-300">
                <MapPin size={18} className="mr-3 text-[#72BAA9] mt-1" />
                <div>
                  <p className="font-semibold">Lokasi</p>
                  <p className="text-sm">{ticketData.event?.location || 'Lokasi Event'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-[#474E93] dark:text-blue-400 mb-4">
              QR Code untuk Masuk Event
            </h3>
            <div className="inline-block p-4 bg-white border-2 border-dashed border-[#72BAA9] rounded-lg">
              <div className="w-48 h-48 bg-black relative mx-auto">
                <div className="absolute inset-2 grid grid-cols-12 gap-px">
                  {qrPattern.map((isWhite, i) => (
                    <div
                      key={i}
                      className={`${isWhite ? "bg-white" : "bg-black"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Scan QR code ini saat masuk event
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              ID: {ticketData.id}
            </p>
          </div>

          {/* Ticket Details */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-[#474E93] dark:text-blue-400 mb-4">
              Detail Tiket
            </h3>
            <div className="space-y-3">
              {ticketData.tickets && ticketData.tickets.length > 0 ? (
                ticketData.tickets.map((ticket, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{ticket.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Rp. {ticket.price?.toLocaleString() || '0'} x {ticket.quantity || 1}
                      </p>
                    </div>
                    <p className="font-bold text-[#7E5CAD] dark:text-purple-400">
                      Rp. {ticket.subtotal?.toLocaleString() || '0'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">Detail tiket tidak tersedia</p>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-[#474E93] text-white rounded-lg">
                <span className="font-semibold">Total Pembayaran</span>
                <span className="font-bold text-lg">Rp. {ticketData.total?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-[#474E93] dark:text-blue-400 mb-6">
              Informasi Pemesan
            </h3>
            <div className="space-y-4">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <div className="w-10 h-10 bg-[#72BAA9]/10 rounded-lg flex items-center justify-center mr-4">
                  <User size={20} className="text-[#72BAA9]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Nama</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{ticketData.user?.name || 'Tidak tersedia'}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <div className="w-10 h-10 bg-[#72BAA9]/10 rounded-lg flex items-center justify-center mr-4">
                  <Mail size={20} className="text-[#72BAA9]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{ticketData.user?.email || 'Tidak tersedia'}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <div className="w-10 h-10 bg-[#72BAA9]/10 rounded-lg flex items-center justify-center mr-4">
                  <Phone size={20} className="text-[#72BAA9]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Telepon</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{ticketData.user?.phone || 'Tidak tersedia'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <p><span className="font-semibold">ID E-Ticket:</span> {ticketData.id}</p>
                <p><span className="font-semibold">ID Pesanan:</span> {ticketData.orderId || 'N/A'}</p>
              </div>
              <div>
                <p><span className="font-semibold">Tanggal Pembelian:</span> {formatDateTime(ticketData.purchaseDate)}</p>
                <p><span className="font-semibold">Status:</span> <span className="text-green-600 capitalize">{ticketData.status || 'confirmed'}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-b-2xl p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => router.back()}
              className="bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>
            <button
              onClick={shareTicket}
              className="bg-[#72BAA9] text-white py-3 rounded-xl font-semibold hover:bg-[#5fa394] transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Bagikan
            </button>
            <button
              onClick={printTicket}
              className="bg-[#7E5CAD] text-white py-3 rounded-xl font-semibold hover:bg-[#6b4d92] transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="bg-[#474E93] text-white py-3 rounded-xl font-semibold hover:bg-[#3c417d] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDownloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download size={18} />
              )}
              PDF
            </button>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Catatan Penting:
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Tunjukkan QR code ini saat masuk event</li>
            <li>• Datang 30 menit sebelum event dimulai</li>
            <li>• Tiket tidak dapat dikembalikan</li>
            <li>• Simpan e-ticket ini hingga event selesai</li>
            <li>• Screenshot atau print e-ticket sebagai backup</li>
          </ul>
        </div>

        {/* Support Contact */}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Butuh bantuan? Hubungi customer service kami di</p>
          <p className="font-semibold text-[#474E93] dark:text-blue-400">
            WhatsApp: +62 812-3456-7890 | Email: support@zonetix.com
          </p>
        </div>
      </div>
    </div>
  );
}
