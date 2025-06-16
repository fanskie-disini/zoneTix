// src/app/eticket/[id]/page.jsx
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
        // Simulasi data jika tidak ada localStorage (untuk testing)
        let storedTickets = {};
        
        // Coba ambil dari localStorage jika tersedia
        if (typeof window !== 'undefined' && window.localStorage) {
          storedTickets = JSON.parse(localStorage.getItem('etickets') || '{}');
        }
        
        // Jika data tidak ditemukan, buat data simulasi untuk demo
        if (!storedTickets[id]) {
          const mockTicketData = {
            id: id,
            orderId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            event: {
              title: "Festival Musik Nusantara 2025",
              date: "2025-07-15T19:00:00.000Z",
              location: "Jakarta International Expo, Kemayoran"
            },
            tickets: [
              {
                name: "VIP Ticket",
                price: 500000,
                quantity: 2,
                subtotal: 1000000
              },
              {
                name: "Regular Ticket", 
                price: 250000,
                quantity: 1,
                subtotal: 250000
              }
            ],
            total: 1250000,
            user: {
              name: "John Doe",
              email: "john.doe@email.com",
              phone: "+62 812-3456-7890"
            },
            purchaseDate: "2025-06-15T10:30:00.000Z",
            status: "confirmed"
          };
          
          // Jika ada localStorage, simpan data mock
          if (typeof window !== 'undefined' && window.localStorage) {
            storedTickets[id] = mockTicketData;
            localStorage.setItem('etickets', JSON.stringify(storedTickets));
          }
          
          setTicketData(mockTicketData);
        } else {
          setTicketData(storedTickets[id]);
        }
      } catch (err) {
        console.error('Error loading ticket data:', err);
        setError('Gagal memuat data e-ticket');
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  // Generate QR code pattern berdasarkan ticket ID
  const generateQRCode = (text, size = 200) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const gridSize = 20;
    const cellSize = size / gridSize;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#FFFFFF";
    // Menggunakan hash dari text untuk pattern yang konsisten
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const hash = (i * gridSize + j + text.length) % 7;
        if (hash < 3) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    return canvas.toDataURL();
  };

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Colors
      const primaryColor = [71, 78, 147]; // #474E93
      const secondaryColor = [114, 186, 169]; // #72BAA9
      const accentColor = [126, 92, 173]; // #7E5CAD

      // Header
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
      doc.text(`Tanggal: ${formatDateTime(ticketData?.event?.date)}`, 20, 75);
      doc.text(`Lokasi: ${ticketData?.event?.location}`, 20, 87);

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
      ticketData?.tickets?.forEach((ticket) => {
        doc.text(
          `${ticket.name} x${ticket.quantity} - Rp. ${ticket.subtotal.toLocaleString()}`,
          25,
          yPos
        );
        yPos += 10;
      });

      // Total
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accentColor);
      doc.text(`TOTAL: Rp. ${ticketData?.total?.toLocaleString()}`, 25, yPos + 5);

      // Order Information
      yPos += 25;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMASI PESANAN", 20, yPos);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`ID Pesanan: ${ticketData?.orderId}`, 20, yPos + 15);
      doc.text(`ID E-Ticket: ${ticketData?.id}`, 20, yPos + 27);
      doc.text(`Nama Pemesan: ${ticketData?.user?.name}`, 20, yPos + 39);
      doc.text(`Email: ${ticketData?.user?.email}`, 20, yPos + 51);
      doc.text(`Telepon: ${ticketData?.user?.phone}`, 20, yPos + 63);

      // QR Code
      const qrCode = generateQRCode(ticketData?.id || '');
      doc.addImage(qrCode, "PNG", pageWidth - 80, yPos + 10, 60, 60);

      doc.setFontSize(8);
      doc.text("Scan QR Code saat masuk event", pageWidth - 80, yPos + 80, {
        align: "left",
      });

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
      doc.save(`e-ticket-${ticketData?.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal mengunduh PDF. Pastikan browser Anda mendukung fitur ini.");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDateTime = (dateString) => {
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
      title: `E-Ticket: ${ticketData.event.title}`,
      text: `Saya akan menghadiri ${ticketData.event.title} pada ${formatDateTime(ticketData.event.date)}`,
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
      // Fallback manual copy
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
              {error || 'ID e-ticket tidak valid atau sudah kedaluwarsa'}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
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
              {ticketData.event.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Calendar size={18} className="mr-3 text-[#72BAA9]" />
                <div>
                  <p className="font-semibold">Tanggal Event</p>
                  <p className="text-sm">{formatDateTime(ticketData.event.date)}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <MapPin size={18} className="mr-3 text-[#72BAA9]" />
                <div>
                  <p className="font-semibold">Lokasi</p>
                  <p className="text-sm">{ticketData.event.location}</p>
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
                  {Array.from({ length: 144 }).map((_, i) => {
                    const hash = (i + ticketData.id.length) % 7;
                    return (
                      <div
                        key={i}
                        className={`${hash < 3 ? "bg-white" : "bg-black"}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Scan QR code ini saat masuk event
            </p>
          </div>

          {/* Ticket Details */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-[#474E93] dark:text-blue-400 mb-4">
              Detail Tiket
            </h3>
            <div className="space-y-3">
              {ticketData.tickets.map((ticket, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{ticket.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rp. {ticket.price?.toLocaleString()} x {ticket.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-[#7E5CAD] dark:text-purple-400">
                    Rp. {ticket.subtotal?.toLocaleString()}
                  </p>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 bg-[#474E93] text-white rounded-lg">
                <span className="font-semibold">Total Pembayaran</span>
                <span className="font-bold text-lg">Rp. {ticketData.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-[#474E93] dark:text-blue-400 mb-4">
              Informasi Pemesan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <User size={18} className="mr-3 text-[#72BAA9]" />
                <div>
                  <p className="font-semibold">Nama</p>
                  <p className="text-sm">{ticketData.user.name}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Mail size={18} className="mr-3 text-[#72BAA9]" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm">{ticketData.user.email}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Phone size={18} className="mr-3 text-[#72BAA9]" />
                <div>
                  <p className="font-semibold">Telepon</p>
                  <p className="text-sm">{ticketData.user.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <p><span className="font-semibold">ID E-Ticket:</span> {ticketData.id}</p>
                <p><span className="font-semibold">ID Pesanan:</span> {ticketData.orderId}</p>
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
