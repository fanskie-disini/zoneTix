// src/app/page.js
"use client";

import { useEffect, useState } from "react";
import { getLatestEvents } from "@/utils/fetchEvents";
import EventCard from "@/components/EventCard";
import FloatingButton from "@/components/FloatingButton";
import LoadingState from "@/components/LoadingState";
import Link from "next/link";

export default function Home() {
  // Tambahkan state declarations yang hilang
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getLatestEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <main className="mx-auto max-w-[95%] sm:max-w-3xl md:max-w-4xl lg:max-w-6xl px-2 mt-20">
        <h2 className="text-2xl font-bold mb-4">
          Event Terbaru{" "}
          <Link href="/event">
            <span className="text-[#72BAA9] text-sm ml-2 cursor-pointer hover:text-gray-600">
              Lihat semua
            </span>
          </Link>
        </h2>

        {/* Optional: Tampilkan loading state */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Memuat event...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} variant="home" />
              ))}
            </div>

            {/* Jika tidak ada event */}
            {events.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Belum ada event tersedia
                </p>
              </div>
            )}
          </>
        )}

        <div>
          <FloatingButton />
        </div>
      </main>
    </>
  );
}
