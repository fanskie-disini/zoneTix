"use client";

import { useState } from "react";

export default function MapSearch({ value, onChange }) {
  const [input, setInput] = useState(value || "");

  const handleSearch = () => {
    // Logika pencarian lokasi bisa diintegrasikan di sini (misalnya pakai Mapbox atau Google Maps)
    onChange(input); // update lokasi ke parent
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Cari lokasi..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 border rounded px-3 py-2"
      />
      <button
        type="button"
        onClick={handleSearch}
        className="bg-[#72BAA9] text-white px-4 py-2 rounded hover:bg-[#5aa191] transition"
      >
        Cari
      </button>
    </div>
  );
}
