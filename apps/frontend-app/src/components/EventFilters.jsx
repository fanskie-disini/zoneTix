// src/components/EventFilters.js
"use client";

import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-date-range";
import { Calendar as CalendarIcon, Search, Filter, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function EventFilters({
  searchQuery,
  dateRange,
  appliedDateRange,
  sortOption,
  onFilterChange,
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter handlers
  const handleApplyDate = () => {
    if (dateRange[0].startDate && dateRange[0].endDate) {
      onFilterChange.appliedDateRange(dateRange[0]);
      setCalendarOpen(false);
    } else {
      alert("Silakan pilih rentang tanggal terlebih dahulu.");
    }
  };

  const handleResetDate = () => {
    onFilterChange.dateRange([
      { startDate: null, endDate: null, key: "selection" },
    ]);
    onFilterChange.appliedDateRange(null);
  };

  const clearAllFilters = () => {
    onFilterChange.search("");
    onFilterChange.dateRange([
      { startDate: null, endDate: null, key: "selection" },
    ]);
    onFilterChange.appliedDateRange(null);
    onFilterChange.sort("latest");
  };

  const hasActiveFilters =
    searchQuery || appliedDateRange || sortOption !== "latest";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header with Clear Filters */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filter & Pencarian
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Hapus Filter
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Filter */}
        <div className="relative" ref={calendarRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tanggal Event
          </label>
          <button
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">
                {appliedDateRange?.startDate && appliedDateRange?.endDate
                  ? `${appliedDateRange.startDate.toLocaleDateString(
                      "id-ID"
                    )} - ${appliedDateRange.endDate.toLocaleDateString(
                      "id-ID"
                    )}`
                  : "Pilih Tanggal"}
              </span>
            </div>
          </button>

          <AnimatePresence>
            {calendarOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <DateRange
                  ranges={dateRange}
                  onChange={(item) =>
                    onFilterChange.dateRange([item.selection])
                  }
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#474E93"]}
                  className="dark:bg-gray-800"
                />

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleResetDate}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApplyDate}
                    className="text-sm bg-[#474E93] text-white px-4 py-2 rounded-lg hover:bg-[#3d4280] transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Urutkan
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
            <select
              value={sortOption}
              onChange={(e) => onFilterChange.sort(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#474E93] focus:border-transparent outline-none transition-colors"
            >
              <option value="latest">Terbaru</option>
              <option value="cheapest">Termurah</option>
              <option value="expensive">Termahal</option>
            </select>
          </div>
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cari Event
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Nama event, artis, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => onFilterChange.search(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#474E93] focus:border-transparent outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onFilterChange.search("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#474E93] text-white text-sm rounded-full">
                Pencarian: "{searchQuery}"
                <button
                  onClick={() => onFilterChange.search("")}
                  className="ml-1 hover:text-gray-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {appliedDateRange && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#474E93] text-white text-sm rounded-full">
                Tanggal:{" "}
                {appliedDateRange.startDate.toLocaleDateString("id-ID")} -{" "}
                {appliedDateRange.endDate.toLocaleDateString("id-ID")}
                <button
                  onClick={handleResetDate}
                  className="ml-1 hover:text-gray-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {sortOption !== "latest" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#474E93] text-white text-sm rounded-full">
                Urutan: {sortOption === "cheapest" ? "Termurah" : "Termahal"}
                <button
                  onClick={() => onFilterChange.sort("latest")}
                  className="ml-1 hover:text-gray-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
