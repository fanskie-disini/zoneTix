"use client";

import { useState, useEffect } from "react";
import {
  X,
  Clock,
  MapPin,
  Ticket,
  CreditCard,
  CheckCircle,
} from "lucide-react";

const CheckoutModal = ({ show, onClose, user, total, event, ticketCounts }) => {
  const [currentStep, setCurrentStep] = useState("detail"); // detail, payment, success
  const [paymentCountdown, setPaymentCountdown] = useState(600); // 10 menit
  const [orderId] = useState(`ORD-${Date.now()}`);
  const [eTicketId] = useState(`TKT-${Date.now()}`);

  // Generate selected tickets
  const selectedTickets =
    event?.tickets
      ?.filter((ticket) => ticketCounts[ticket.id] > 0)
      .map((ticket) => ({
        ...ticket,
        quantity: ticketCounts[ticket.id],
        subtotal: ticket.price * ticketCounts[ticket.id],
      })) || [];

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
    setCurrentStep("payment");
  };

  const handlePaymentComplete = () => {
    setCurrentStep("success");
  };

  const handleClose = () => {
    setCurrentStep("detail");
    setPaymentCountdown(600);
    onClose();
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

      {/* Customer Info */}
      <div className="space-y-3">
        <h4 className="font-semibold text-[#474E93] dark:text-blue-300">
          Informasi Pemesan
        </h4>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Nama:</span>{" "}
            {user?.user_metadata?.name}
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Email:</span> {user?.email}
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Telepon:</span>{" "}
            {user?.user_metadata?.phone}
          </p>
        </div>
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
        onClick={handlePayNow}
        className="w-full py-3 bg-[#474E93] hover:bg-[#3c417d] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <CreditCard size={20} />
        Bayar Sekarang
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
          {/* Placeholder QR Code - In real app, generate actual QR */}
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
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Tunjukkan QR code ini saat masuk event
        </p>
      </div>

      {/* Customer Info */}
      <div className="bg-[#F8F9FC] dark:bg-gray-700 p-4 rounded-xl text-left">
        <h4 className="font-semibold text-[#474E93] dark:text-blue-300 mb-3">
          Informasi Pemesan:
        </h4>
        <div className="text-sm space-y-1">
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Nama:</span>{" "}
            {user?.user_metadata?.name}
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Email:</span> {user?.email}
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-medium">Telepon:</span>{" "}
            {user?.user_metadata?.phone}
          </p>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="w-full py-3 bg-[#474E93] text-white rounded-xl font-semibold hover:bg-[#3c417d] transition-colors"
      >
        Selesai
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
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
