// src/app/eticket/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ETicketPage({ params }) {
  const { id } = params;
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    // Ganti ini dengan fetch ke Supabase atau sumber data kamu
    const fetchData = async () => {
      // Contoh dummy data
      const mockData = {
        eventName: "Konser Musik Spektakuler",
        buyerName: "John Doe",
        email: "johndoe@email.com",
        ticketId: id,
        date: "2025-06-10",
        location: "Lapangan Simpang Lima, Semarang",
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?data=ETICKET-${id}&size=150x150`,
      };
      setTicketData(mockData);
    };

    fetchData();
  }, [id]);

  if (!ticketData) return <p>Loading e-ticket...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md mt-8 text-center border border-gray-300">
      <h1 className="text-2xl font-bold mb-4">E-Ticket</h1>
      <p className="text-lg font-medium">{ticketData.eventName}</p>
      <p className="text-sm text-gray-600">Tanggal: {ticketData.date}</p>
      <p className="text-sm text-gray-600">Lokasi: {ticketData.location}</p>

      <hr className="my-4" />

      <p className="text-md font-semibold">Nama: {ticketData.buyerName}</p>
      <p className="text-sm">Email: {ticketData.email}</p>
      <p className="text-sm">Kode Tiket: {ticketData.ticketId}</p>

      <div className="mt-6">
        <img
          src={ticketData.qrCodeUrl}
          alt="QR Code Tiket"
          className="mx-auto"
        />
        <p className="text-xs mt-2 text-gray-500">Tunjukkan QR ini saat masuk.</p>
      </div>
    </div>
  );
}
