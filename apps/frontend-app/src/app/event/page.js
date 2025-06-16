// src/app/event/page.js
"use client";

import { useEffect, useState } from "react";
import { getAllEvents } from "@/utils/fetchEvents";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import LoadingState from "@/components/EventsLoadingState";
import FloatingButton from "@/components/FloatingButton";

// Constants
const SORT_OPTIONS = {
  LATEST: "latest",
  CHEAPEST: "cheapest",
  EXPENSIVE: "expensive",
};

const INITIAL_DATE_RANGE = {
  startDate: null,
  endDate: null,
  key: "selection",
};

export default function EventPage() {
  // State management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState([INITIAL_DATE_RANGE]);
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.LATEST);

  // Data fetching
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getAllEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Helper function to get minimum price (moved outside for reusability)
  const getMinPrice = (event) => {
    // Handle events with tickets array
    if (
      event?.tickets &&
      Array.isArray(event.tickets) &&
      event.tickets.length > 0
    ) {
      const validPrices = event.tickets
        .map((ticket) => {
          const price = parseFloat(ticket.price);
          return isNaN(price) ? 0 : price;
        })
        .filter((price) => price >= 0);

      return validPrices.length > 0 ? Math.min(...validPrices) : 0;
    }

    // Handle events with direct price property
    if (event?.price !== undefined && event?.price !== null) {
      const price = parseFloat(event.price);
      return isNaN(price) ? 0 : Math.max(0, price);
    }

    // Default to 0 if no price information
    return 0;
  };

  // Filter and sort events
  const filteredEvents = events
    .filter((event) => {
      // Filter by date range
      if (!appliedDateRange?.startDate || !appliedDateRange?.endDate) {
        return true;
      }
      const eventDate = new Date(event.date);
      return (
        eventDate >= appliedDateRange.startDate &&
        eventDate <= appliedDateRange.endDate
      );
    })
    .filter((event) => {
      // Filter by search query
      const title = event.title || event.event || "";
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      // Sort events
      if (sortOption === SORT_OPTIONS.LATEST) {
        const dateA = new Date(a.created_at || a.date || 0);
        const dateB = new Date(b.created_at || b.date || 0);
        return dateB - dateA;
      }

      if (sortOption === SORT_OPTIONS.CHEAPEST) {
        const priceA = getMinPrice(a);
        const priceB = getMinPrice(b);

        // Handle free events (price = 0) - they should appear first
        if (priceA === 0 && priceB === 0) return 0;
        if (priceA === 0) return -1;
        if (priceB === 0) return 1;

        return priceA - priceB;
      }

      if (sortOption === SORT_OPTIONS.EXPENSIVE) {
        const priceA = getMinPrice(a);
        const priceB = getMinPrice(b);

        // Handle free events (price = 0) - they should appear last
        if (priceA === 0 && priceB === 0) return 0;
        if (priceA === 0) return 1;
        if (priceB === 0) return -1;

        return priceB - priceA;
      }

      return 0;
    });

  // Filter handlers
  const handleFilterChange = {
    search: (value) => setSearchQuery(value),
    dateRange: (value) => setDateRange(value),
    appliedDateRange: (value) => setAppliedDateRange(value),
    sort: (value) => setSortOption(value),
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="mx-auto max-w-[95%] sm:max-w-3xl md:max-w-4xl lg:max-w-6xl px-2 mt-23 space-y-6">
      {/* Page Header */}
      <PageHeader />

      {/* Filters Section */}
      <EventFilters
        searchQuery={searchQuery}
        dateRange={dateRange}
        appliedDateRange={appliedDateRange}
        sortOption={sortOption}
        onFilterChange={handleFilterChange}
      />

      {/* Events Grid */}
      <EventsGrid
        events={filteredEvents}
        hasActiveFilters={Boolean(searchQuery || appliedDateRange)}
      />
    </div>
  );
}

// Page Header Component
function PageHeader() {
  return (
    <div className="bg-gradient-to-r from-[#474E93] to-[#5a63b8] text-white rounded-2xl p-8 text-center shadow-lg">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Semua Event</h1>
      <p className="text-white/80 text-lg">
        Temukan event menarik di sekitar Anda
      </p>
    </div>
  );
}

// Events Grid Component
function EventsGrid({ events, hasActiveFilters }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto mb-6 w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-3xl">📅</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {hasActiveFilters ? "Tidak ada event ditemukan" : "Belum ada event"}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {hasActiveFilters
            ? "Coba ubah filter pencarian Anda"
            : "Event akan segera tersedia"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          Menampilkan <span className="font-semibold">{events.length}</span>{" "}
          event
        </p>
        {hasActiveFilters && (
          <div className="text-sm text-[#474E93] dark:text-[#D5E7B5] font-medium">
            ✨ Filter aktif
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      <div>
        <FloatingButton />
      </div>
    </div>
  );
}
