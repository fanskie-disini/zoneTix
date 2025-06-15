"use client";

import Link from "next/link";
import Image from "next/image";
import { slugify } from "@/utils/slugify";
import { useState, useMemo } from "react";
import EventCardDate from "./EventCardDate";
import { MapPin, Calendar } from "lucide-react";

export default function EventCard({ event }) {
  const title = event?.title || event?.event || "Tanpa Judul";
  const slug = slugify(title);

  // Perbaikan untuk mengambil image_url dari database
  const rawImage = event?.image_url || event?.imageUrl || event?.image || "";

  // Logika untuk menentukan URL gambar
  let imageUrl = "/placeholder.jpg"; // default

  if (rawImage) {
    if (rawImage.startsWith("http")) {
      imageUrl = rawImage;
    } else {
      const imageFileName = rawImage.includes("/")
        ? rawImage.split("/").pop()
        : rawImage;
      imageUrl = `https://kdvjzjlkhgvgzrwunkjp.supabase.co/storage/v1/object/public/event-images/${imageFileName}`;
    }
  }

  const [imageSrc, setImageSrc] = useState(imageUrl);
  const location = event?.location || "-";

  // Optimized price calculation with useMemo
  const priceData = useMemo(() => {
    console.log("Event ID:", event?.id);
    console.log("Raw tickets data:", event?.tickets);

    // Check if tickets data exists and is valid
    if (
      !event?.tickets ||
      !Array.isArray(event.tickets) ||
      event.tickets.length === 0
    ) {
      console.log("No tickets found or tickets is not an array");
      return { minPrice: 0, hasTickets: false, ticketCount: 0 };
    }

    // Process tickets and extract valid prices
    const validPrices = event.tickets
      .map((ticket, index) => {
        const price = Number(ticket.price || 0);
        console.log(`Ticket ${index} (${ticket.name || "Unknown"}):`, {
          originalPrice: ticket.price,
          convertedPrice: price,
          isValid: !isNaN(price) && price > 0,
        });
        return price;
      })
      .filter((price) => !isNaN(price) && price > 0);

    console.log("Valid prices array:", validPrices);

    if (validPrices.length === 0) {
      console.log("No valid prices found");
      return {
        minPrice: 0,
        hasTickets: false,
        ticketCount: event.tickets.length,
      };
    }

    const minPrice = Math.min(...validPrices);
    console.log("Calculated min price:", minPrice);

    return {
      minPrice,
      hasTickets: true,
      ticketCount: event.tickets.length,
      validTicketCount: validPrices.length,
    };
  }, [event?.tickets, event?.id]);

  const { minPrice, hasTickets, ticketCount, validTicketCount } = priceData;

  // Additional debugging
  console.log("Final pricing result:", {
    eventId: event?.id,
    eventTitle: title,
    totalTickets: ticketCount,
    validTickets: validTicketCount,
    minPrice,
    hasTickets,
    ticketsData: event?.tickets?.map((t) => ({ name: t.name, price: t.price })),
  });

  return (
    <Link href={`/event/${slug}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 flex flex-col h-full">
          {/* Image Container - Square 1:1 Aspect Ratio */}
          <div className="relative aspect-square overflow-hidden flex-shrink-0">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageSrc("/placeholder.jpg")}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Bottom Badges */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between gap-2">
                {/* Location Badge */}
                <div className="flex items-center gap-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm shadow-lg">
                  <MapPin className="h-3 w-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium max-w-[120px] truncate">
                    {location}
                  </span>
                </div>

                {/* Date Badge */}
                <div className="flex items-center gap-1 bg-[#474E93] text-white rounded-full px-3 py-1.5 text-sm font-medium shadow-lg">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    <EventCardDate date={event.date} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content - Flexible Layout */}
          <div className="p-5 flex flex-col flex-1">
            {/* Title - Fixed Space */}
            <div className="mb-4 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#474E93] dark:group-hover:text-[#D5E7B5] transition-colors min-h-[3.5rem]">
                {title}
              </h3>
            </div>

            {/* Price Section - Always at Bottom */}
            <div className="flex items-center justify-between gap-3 mt-auto">
              {/* Price Info - Left Side */}
              <div className="flex-1 min-w-0">
                {hasTickets ? (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5 sm:mb-1">
                      Mulai dari
                    </p>
                    <p className="text-xl sm:text-lg font-bold text-[#6a00ff] dark:text-[#c6a0ff] leading-tight">
                      Rp {minPrice.toLocaleString("id-ID")}
                    </p>
                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === "development" && (
                      <p className="text-xs text-gray-400 mt-1">
                        {validTicketCount}/{ticketCount} tiket valid
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400">
                      {ticketCount > 0
                        ? "Harga tidak valid"
                        : "Belum ada tiket"}
                    </p>
                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === "development" &&
                      ticketCount > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {ticketCount} tiket ditemukan, tapi harga tidak valid
                        </p>
                      )}
                  </div>
                )}
              </div>

              {/* Ticket Status - Right Side */}
              <div className="flex-shrink-0">
                <div
                  className={`inline-flex items-center px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full text-sm sm:text-xs font-semibold transition-colors ${
                    hasTickets
                      ? "bg-[#D5E7B5] text-[#474E93] dark:bg-[#474E93] dark:text-[#D5E7B5]"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full mr-2 sm:mr-1.5 flex-shrink-0 ${
                      hasTickets ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span className="whitespace-nowrap text-xs sm:text-xs">
                    {hasTickets ? "Tersedia" : "Habis"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#D5E7B5] dark:group-hover:border-[#474E93] transition-colors pointer-events-none" />
        </div>
      </div>
    </Link>
  );
}
