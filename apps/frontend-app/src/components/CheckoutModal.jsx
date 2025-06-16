"use client";

import { useState, useEffect } from "react";
import {
  X,
  Clock,
  MapPin,
  Ticket,
  CreditCard,
  CheckCircle,
  Download,
  Mail,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const CheckoutModal = ({ show, onClose, total, event, ticketCounts }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState("detail");
  const [paymentCountdown, setPaymentCountdown] = useState(600);
  const [orderId] = useState(`ORD-${Date.now()}`);
  const [eTicketId] = useState(`TKT-${Date.now()}`);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Generate selected tickets
  const selectedTickets =
    event?.tickets
      ?.filter((ticket) => ticketCounts[ticket.id] > 0)
      .map((ticket) => ({
        ...ticket,
        quantity: ticketCounts[ticket.id],
        subtotal: ticket.price * ticketCounts[ticket.id],
      })) || [];

  // Get user's full name
  const getUserFullName = () => {
    if (!user) return "Tidak tersedia";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Tidak tersedia";
  };

  // Get user's phone number (format display)
  const getUserPhone = () => {
    if (!user?.phone) return "Tidak tersedia";
    const phone = user.phone.replace("62", "");
    return `+62 ${phone}`;
  };

  // Payment countdown effect
  useEffect(() => {
    if (currentStep === "payment" && paymentCountdown > 0) {
      const timer = setInterval(() => {
        setPaymentCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, paymentCountdown]);

  if (!show) return null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePayNow = () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }
    setCurrentStep("payment");
  };

  const handleLoginOrPay = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentStep("payment");
  };

  // FUNGSI BARU: Simpan data e-ticket ke localStorage
  const saveTicketToLocalStorage = () => {
    try {
      const ticketData = {
        id: eTicketId,
        orderId: orderId,
        event: {
          title: event?.title || "Event Title",
          date: event?.date || new Date().toISOString(),
          location: event?.location || "Event Location"
        },
        tickets: selectedTickets.map(ticket => ({
          name: ticket.name,
          price: ticket.price,
          quantity: ticket.quantity,
          subtotal: ticket.subtotal
        })),
        total: total,
        user: {
          name: getUserFullName(),
          email: user?.email || "user@email.com",
          phone: getUserPhone()
        },
        purchaseDate: new Date().toISOString(),
        status: "confirmed"
      };

      // Ambil data existing dari localStorage
      let storedTickets = {};
      if (typeof window !== 'undefined' && window.localStorage) {
        storedTickets = JSON.parse(localStorage.getItem('etickets') || '{}');
      }

      // Tambahkan tiket baru
      storedTickets[eTicketId] = ticketData;

      // Simpan kembali ke localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('etickets', JSON.stringify(storedTickets));
      }

      console.log('Ticket data saved to localStorage:', ticketData);
    } catch (error) {
      console.error('Error saving ticket to localStorage:', error);
    }
  };

  const handlePaymentComplete = () => {
    // Simpan data ke localStorage sebelum pindah ke step success
    saveTicketToLocalStorage();
    
    setCurrentStep("success");
    // Auto send email after payment success
    handleSendEmailTicket();
  };

  const handleClose = () => {
    setCurrentStep("detail");
    setPaymentCountdown(600);
    setIsEmailSent(false);
    setIsEmailSending(false);
    onClose();
  };

  // Generate PDF ticket - UPDATED dengan data yang sama
  const generatePDFTicket = async () => {
    setIsProcessingPDF(true);
    try {
      // Gunakan jsPDF untuk membuat PDF yang sama dengan e-ticket page
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
      doc.text(event?.title || "Event Title", 20, 60);

      // Event Details
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Tanggal: ${event?.date}`, 20, 75);
      doc.text(`Lokasi: ${event?.location}`, 20, 87);

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
      selectedTickets.forEach((ticket) => {
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
      doc.text(`TOTAL: Rp. ${total.toLocaleString()}`, 25, yPos + 5);

      // Order Information
      yPos += 25;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMASI PESANAN", 20, yPos);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`ID Pesanan: ${orderId}`, 20, yPos + 15);
      doc.text(`ID E-Ticket: ${eTicketId}`, 20, yPos + 27);
      doc.text(`Nama Pemesan: ${getUserFullName()}`, 20, yPos + 39);
      doc.text(`Email: ${user?.email || 'N/A'}`, 20, yPos + 51);
      doc.text(`Telepon: ${getUserPhone()}`, 20, yPos + 63);

      // QR Code placeholder
      doc.setFillColor(0, 0, 0);
      doc.rect(pageWidth - 80, yPos + 10, 60, 60, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("QR CODE", pageWidth - 50, yPos + 40, { align: "center" });

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
      doc.save(`e-ticket-${eTicketId}.pdf`);
      toast.success("E-ticket berhasil diunduh!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal mengunduh e-ticket");
    } finally {
      setIsProcessingPDF(false);
    }
  };

  // Send email ticket - UPDATED
  const handleSendEmailTicket = async () => {
    if (!user?.email) {
      toast.error("Email tidak tersedia");
      return;
    }

    if (isEmailSending) {
      return; // Prevent multiple calls
    }

    setIsEmailSending(true);

    try {
      const ticketData = {
        orderId,
        eTicketId,
        event: {
          id: event?.id,
          title: event?.title,
          date: event?.date,
          location: event?.location,
        },
        user: {
          name: getUserFullName(),
          email: user.email,
          phone: getUserPhone(),
        },
        tickets: selectedTickets,
        total,
        purchaseDate: new Date().toISOString(),
      };

      const response = await fetch("/api/send-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirim email");
      }

      if (result.success) {
        setIsEmailSent(true);
        toast.success(`E-ticket berhasil dikirim ke ${user.email}`);
      } else {
        throw new Error(result.message || "Gagal mengirim email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(error.message || "Gagal mengirim e-ticket ke email");
    } finally {
      setIsEmailSending(false);
    }
  };

  // Navigate to e-ticket page
  const viewETicket = () => {
    router.push(`/eticket/${eTicketId}`);
  };

  const DetailStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-2xl font-bold text-[#474E93] dark:text-blue-400">
          Detail Pesanan
        </h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={24} />
        </button>
      </div>

      {/* Event Info */}
      <div className="bg-gradient-to-r from-[#F8F9FC] to-[#E8F5E8] dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl">
        <h3 className="font-bold text-[#474E93] dark:text-blue-300 text-lg mb-2">
          {event?.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-[#72BAA9] dark:text-green-300">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{event?.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{event?.location}</span>
          </div>
        </div>
      </div>

      {/* Selected Tickets */}
      <div className="space-y-3">
        <h4 className="font-semibold text-[#474E93] dark:text-blue-300 flex items-center gap-2">
          <Ticket size={18} />
          Tiket yang Dipilih
        </h4>
        {selectedTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 border border-[#D5E7B5] dark:border-gray-600 rounded-lg"
          >
            <div>
              <p className="font-medium text-[#474E93] dark:text-blue-300">
                {ticket.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rp. {ticket.price.toLocaleString()} x {ticket.quantity}
              </p>
            </div>
            <p className="font-bold text-[#7E5CAD] dark:text-purple-400">
              Rp. {ticket.subtotal.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Customer Info - Updated to use user data */}
      <div className="space-y-3">
        <h4 className="font-semibold text-[#474E93] dark:text-blue-300">
          Informasi Pemesan
        </h4>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Nama:</span> {getUserFullName()}
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Email:</span>{" "}
            {user?.email || "Tidak tersedia"}
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Telepon:</span> {getUserPhone()}
          </p>
        </div>
        {!user && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              Silakan login untuk melanjutkan pemesanan
            </p>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-[#7E5CAD] to-[#72BAA9] p-4 rounded-xl text-white">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total Pembayaran</span>
          <span className="text-2xl font-bold">
            Rp. {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleLoginOrPay}
        disabled={!user}
        className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
          user
            ? "bg-[#474E93] hover:bg-[#3c417d] text-white"
            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        }`}
      >
        <CreditCard size={20} />
        {user ? "Bayar Sekarang" : "Login untuk Bayar"}
      </button>
    </div>
  );

  const PaymentStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-2xl font-bold text-[#474E93] dark:text-blue-400">
          Pembayaran QRIS
        </h2>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Waktu tersisa
          </p>
          <p className="text-xl font-bold text-red-500">
            {formatTime(paymentCountdown)}
          </p>
        </div>
      </div>

      {/* Order ID */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">ID Pesanan</p>
        <p className="font-bold text-[#474E93] dark:text-blue-300 text-lg">
          {orderId}
        </p>
      </div>

      {/* QRIS Code */}
      <div className="bg-white dark:bg-gray-700 border-2 border-dashed border-[#72BAA9] dark:border-green-400 rounded-xl p-6 text-center space-y-4">
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-600 dark:to-gray-700 p-4 rounded-lg border dark:border-gray-600">
          <div className="w-48 h-48 mx-auto bg-black relative">
            <div className="absolute inset-2 grid grid-cols-12 gap-px">
              {Array.from({ length: 144 }).map((_, i) => (
                <div
                  key={i}
                  className={`${Math.random() > 0.5 ? "bg-white" : "bg-black"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-bold text-[#474E93] dark:text-blue-300 text-lg">
            Scan QRIS Code
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Gunakan aplikasi mobile banking atau e-wallet untuk scan
          </p>
          <p className="font-bold text-[#7E5CAD] dark:text-purple-400 text-xl">
            Rp. {total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-[#F8F9FC] dark:bg-gray-700 p-4 rounded-xl">
        <h4 className="font-semibold text-[#474E93] dark:text-blue-300 mb-3">
          Cara Pembayaran:
        </h4>
        <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li>1. Buka aplikasi mobile banking atau e-wallet Anda</li>
          <li>2. Pilih menu "Scan QR" atau "QRIS"</li>
          <li>3. Arahkan kamera ke QR code di atas</li>
          <li>4. Konfirmasi pembayaran sebesar Rp. {total.toLocaleString()}</li>
          <li>5. Tunggu konfirmasi pembayaran berhasil</li>
        </ol>
      </div>

      {/* Mock Payment Success Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-400 text-center mb-3">
          *Demo: Klik tombol di bawah untuk simulasi pembayaran berhasil
        </p>
        <button
          onClick={handlePaymentComplete}
          className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Simulasi Pembayaran Berhasil
        </button>
      </div>
    </div>
  );

  const SuccessStep = () => (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircle
            size={40}
            className="text-green-600 dark:text-green-400"
          />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
          Pembayaran Berhasil!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Terima kasih, pesanan Anda telah dikonfirmasi
        </p>
        {isEmailSent && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            ✓ E-ticket telah dikirim ke email Anda
          </p>
        )}
      </div>

      {/* Invoice Details */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 text-left">
        <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-600">
          <h3 className="font-bold text-[#474E93] dark:text-blue-300">
            INVOICE
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("id-ID")}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              ID Pesanan:
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {orderId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              ID E-Tiket:
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {eTicketId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Event:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {event?.title}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Tanggal:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {event?.date}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Lokasi:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {event?.location}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t dark:border-gray-600">
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Detail Tiket:
          </h4>
          {selectedTickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 dark:text-gray-300">
                {ticket.name} x{ticket.quantity}
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                Rp. {ticket.subtotal.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-600">
            <span className="text-gray-900 dark:text-gray-100">Total:</span>
            <span className="text-[#7E5CAD] dark:text-purple-400">
              Rp. {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* E-Ticket QR Code */}
      <div className="bg-white dark:bg-gray-700 border-2 border-[#72BAA9] dark:border-green-400 rounded-xl p-6">
        <h4 className="font-bold text-[#474E93] dark:text-blue-300 mb-4">
          E-Tiket QR Code
        </h4>
        <div className="w-40 h-40 mx-auto bg-black relative mb-4">
          <div className="absolute inset-2 grid grid-cols-10 gap-px">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className={`${Math.random() > 0.4 ? "bg-white" : "bg-black"}`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Tunjukkan QR code ini saat masuk event
        </p>

        {/* E-Ticket Actions */}
        <div className="flex flex-col gap-3 mt-4">
          <button 
            onClick={viewETicket}
            className="flex items-center justify-center gap-2 bg-[#474E93] text-white px-4 py-2 rounded-lg hover:bg-[#3c417d] transition-colors"
          >
            <ExternalLink size={16} />
            Lihat E-Ticket
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={generatePDFTicket}
              disabled={isProcessingPDF}
              className="flex items-center justify-center gap-2 bg-[#72BAA9] text-white px-3 py-2 rounded-lg hover:bg-[#5da89a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingPDF ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Download size={16} />
              )}
              {isProcessingPDF ? "..." : "Unduh PDF"}
            </button>

            <button
              onClick={handleSendEmailTicket}
              disabled={isEmailSent}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isEmailSent
                  ? "bg-green-600 text-white cursor-default"
                  : "bg-[#7E5CAD] text-white hover:bg-[#6b4c94]"
              }`}
            >
              <Mail size={16} />
              {isEmailSent ? "Terkirim" : "Kirim Email"}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Info - Updated to use user data */}
      <div className="bg-[#F8F9FC] dark:bg-gray-700 p-4 rounded-xl text-left">
        <h4 className="font-semibold text-[#474E93] dark:text-blue-300 mb-3">
          Informasi Pemesan:
        </h4>
        <div className="text-sm space-y-1">
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Nama:</span> {getUserFullName()}
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Email:</span>{" "}
            {user?.email || "Tidak tersedia"}
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Telepon:</span> {getUserPhone()}
          </p>
        </div>
      </div>
      
      {/* Close Button - Lanjutan dari Success Step */}
      <button
        onClick={handleClose}
        className="w-full py-3 bg-[#474E93] text-white rounded-xl font-semibold hover:bg-[#3c417d] transition-colors"
      >
        Selesai
      </button>
    </div>
  );

  // Render berdasarkan step
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {currentStep === "detail" && <DetailStep />}
          {currentStep === "payment" && <PaymentStep />}
          {currentStep === "success" && <SuccessStep />}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
