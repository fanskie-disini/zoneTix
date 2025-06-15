"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventBySlug } from "@/utils/fetchEvents";
import CheckoutModal from "@/components/CheckoutModal";

export default function EventDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [ticketCounts, setTicketCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const dummyUser = {
    email: "contoh@email.com",
    user_metadata: {
      name: "Budi Santoso",
      phone: "081234567890",
    },
  };

  useEffect(() => {
    const fetchEvent = async () => {
      const data = await getEventBySlug(slug);
      setEvent(data);
    };
    fetchEvent();
  }, [slug]);

  useEffect(() => {
    if (event?.tickets) {
      let sum = 0;
      event.tickets.forEach((ticket) => {
        const qty = ticketCounts[ticket.id] || 0;
        sum += ticket.price * qty;
      });
      setTotal(sum);
    }
  }, [ticketCounts, event]);

  const handleQtyChange = (ticketId, type) => {
    setTicketCounts((prev) => {
      const current = prev[ticketId] || 0;
      const updated = type === "inc" ? current + 1 : Math.max(current - 1, 0);
      return { ...prev, [ticketId]: updated };
    });
  };

  if (!event) return <p className="text-center py-10">Loading...</p>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-10 mt-10">
      {/* Breadcrumb */}
      <div className="text-sm text-[#7E5CAD] mb-2">
        <span
          className="hover:underline cursor-pointer"
          onClick={() => router.push("/")}
        >
          Home
        </span>{" "}
        &gt;
        <span
          className="hover:underline cursor-pointer"
          onClick={() => router.push("/event")}
        >
          Event
        </span>{" "}
        &gt;
        <span className="ml-1 font-medium text-[#474E93]">{event.title}</span>
      </div>

      {/* Judul dan Gambar */}
      <div>
        <h1 className="text-3xl font-bold text-[#474E93] mb-1">
          {event.title}
        </h1>
        <p className="text-[#72BAA9] mb-4">
          {event.location} | {event.date}
        </p>
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-96 object-cover rounded-xl shadow-lg border border-[#D5E7B5]"
        />
      </div>

      {/* Tentang Event */}
      <section>
        <h2 className="text-xl font-semibold border-l-4 pl-3 border-[#7E5CAD] mb-2">
          Tentang Event ini
        </h2>
        <p className="text-gray-700">{event.description || "-"}</p>
      </section>

      {/* Pilihan Tiket */}
      {event.tickets?.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-l-4 pl-3 border-[#7E5CAD]">
            Pilihan Tiket
          </h2>
          <div className="bg-[#F8F9FC] p-4 rounded-xl shadow-sm border border-[#D5E7B5]">
            <h3 className="font-bold text-[#474E93] mb-2">{event.title}</h3>
            <p className="text-sm text-[#72BAA9] mb-4">
              {event.date} @ {event.location}
            </p>

            {event.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-[#72BAA9] bg-white p-4 rounded-lg mb-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-[#474E93]">
                      {ticket.name}
                    </p>
                    <p className="text-sm text-gray-500">Harga</p>
                    <p className="text-lg font-bold text-[#7E5CAD]">
                      Rp. {ticket.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQtyChange(ticket.id, "dec")}
                      className="px-3 py-1 bg-[#D5E7B5] text-[#474E93] rounded hover:bg-[#c4d9a8] transition-colors"
                    >
                      −
                    </button>
                    <span className="min-w-[20px] text-center text-[#474E93] font-medium">
                      {ticketCounts[ticket.id] || 0}
                    </span>
                    <button
                      onClick={() => handleQtyChange(ticket.id, "inc")}
                      className="px-3 py-1 bg-[#72BAA9] text-white rounded hover:bg-[#5fa094] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 border-t border-[#D5E7B5] mt-4">
              <p className="text-lg font-bold text-[#474E93]">Total</p>
              <p className="text-lg font-bold text-[#72BAA9]">
                Rp. {total.toLocaleString()}
              </p>
            </div>

            <button
              disabled={total === 0}
              onClick={() => setShowModal(true)}
              className="mt-4 w-full py-3 bg-gradient-to-r from-[#474E93] to-[#7E5CAD] text-white rounded-xl font-semibold hover:from-[#3c417d] hover:to-[#6b4d96] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
            >
              {total === 0 ? "Pilih Tiket Terlebih Dahulu" : "Pesan Sekarang"}
            </button>
          </div>
        </section>
      )}

      {/* Lokasi */}
      <section>
        <h2 className="text-xl font-semibold border-l-4 pl-3 border-[#7E5CAD] mb-2">
          Lokasi
        </h2>
        <div className="h-64 w-full bg-gray-200 rounded-lg overflow-hidden border border-[#D5E7B5]">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              event.location
            )}&output=embed`}
            width="100%"
            height="100%"
            allowFullScreen=""
            loading="lazy"
            className="w-full h-full border-0"
          ></iframe>
        </div>
        <p className="text-sm text-gray-500 mt-1">{event.location}</p>
      </section>

      <CheckoutModal
        show={showModal}
        onClose={() => setShowModal(false)}
        user={dummyUser}
        total={total}
        event={event}
        ticketCounts={ticketCounts}
      />
    </main>
  );
}