// event/create/page.jsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Trash, Calendar, MapPin, CheckCircle, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import UploadFileInput from "@/components/UploadFileInput";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

const MapSearch = dynamic(() => import("@/components/MapSearch"), { ssr: false });

// Approval Popup Component
function ApprovalPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1e1e2e] rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Event Berhasil Dibuat!
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Terima kasih telah mendaftarkan event Anda. Event Anda sedang menunggu persetujuan dari admin dan akan segera ditampilkan setelah disetujui.
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Menunggu Persetujuan Admin</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-[#474E93] hover:bg-[#372f80] dark:bg-[#72BAA9] dark:hover:bg-[#5da594] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateEventContent() {
  const [tickets, setTickets] = useState([{ name: "", price: "" }]);
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [dateType, setDateType] = useState("text");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const dateRef = useRef(null);
  const [resetKey, setResetKey] = useState(0);

  const handleAddTicket = () => {
    setTickets([...tickets, { name: "", price: "" }]);
  };

  const handleRemoveTicket = (index) => {
    setTickets(tickets.filter((_, i) => i !== index));
  };

  const handleTicketChange = (index, field, value) => {
    const updated = [...tickets];
    updated[index][field] = value;
    setTickets(updated);
  };

  const formatRupiah = (number) => {
    if (!number) return "";
    return "Rp" + Number(number).toLocaleString("id-ID");
  };

  // Handle location search with debouncing and fallback
  const performLocationSearch = useCallback(async (query) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    // Local Indonesian cities/locations for fallback
    const indonesianLocations = [
      "Jakarta Pusat",
      "Jakarta Selatan", 
      "Jakarta Utara",
      "Jakarta Barat",
      "Jakarta Timur",
      "Bandung",
      "Surabaya",
      "Yogyakarta",
      "Semarang",
      "Medan",
      "Makassar",
      "Denpasar",
      "Palembang",
      "Tangerang",
      "Depok",
      "Bekasi",
      "Bogor",
      "Malang",
      "Solo",
      "Balikpapan",
      "Banjarmasin",
      "Pontianak",
      "Samarinda",
      "Manado",
      "Pekanbaru",
      "Padang",
      "Batam",
      "Jambi",
      "Lampung",
      "Mataram",
      "Brebes",
      "Pemalang",
      "Jepara",
      "Tegal"
    ];

    // Always use local filtering as primary method to avoid CORS issues
    const filtered = indonesianLocations
      .filter(location => 
        location.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map(location => ({
        display_name: location,
        lat: null,
        lon: null
      }));

    setLocationSuggestions(filtered);
    setShowLocationSuggestions(filtered.length > 0);
  }, []);

  const handleLocationSearch = (query) => {
    setLocation(query);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debouncing
    const newTimeout = setTimeout(() => {
      performLocationSearch(query);
    }, 300);
    
    setSearchTimeout(newTimeout);
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation.display_name);
    setShowLocationSuggestions(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleDateFocus = () => {
    setDateType("date");
    setTimeout(() => {
      if (dateRef.current) {
        dateRef.current.showPicker?.();
      }
    }, 0);
  };

  const handleDateBlur = () => {
    setTimeout(() => {
      setDateType("text");
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Validate and parse tickets
      const validTickets = tickets.filter(ticket => ticket.name.trim() && ticket.price);
      if (validTickets.length === 0) {
        alert("Minimal harus ada satu tiket yang valid.");
        return;
      }

      const parsedTickets = validTickets.map((ticket) => ({
        name: ticket.name.trim(),
        price: parseInt(ticket.price.toString().replace(/\D/g, ""), 10) || 0,
      }));

      let uploadedImageUrl = "";

      // Handle image upload
      if (imageFile) {
        if (imageFile.size > 5 * 1024 * 1024) {
          alert("Ukuran gambar maksimal 5MB. Silakan unggah gambar yang lebih kecil.");
          return;
        }

        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `events/${fileName}`;

        const { data, error } = await supabase.storage
          .from("event-images")
          .upload(filePath, imageFile);

        if (error) {
          console.error("Upload error:", error.message);
          alert("Gagal upload gambar: " + error.message);
          return;
        }

        // Get public URL
        const publicUrlResponse = supabase.storage
          .from("event-images")
          .getPublicUrl(filePath);

        uploadedImageUrl = publicUrlResponse.data?.publicUrl || "";
      }

      // Prepare payload matching your database schema
      const payload = {
        title: e.target.title.value.trim(),
        location: location.trim(),
        date: dateRef.current.value,
        image_url: uploadedImageUrl, // Note: using image_url to match your schema
        description: description.trim(),
        tickets: parsedTickets,
      };

      console.log("Payload being sent:", payload);

      // Try multiple API endpoint possibilities
      const possibleEndpoints = [
        "https://zonetix.vercel.app/api/events"
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            console.log(`Success with endpoint: ${endpoint}`);
            break;
          } else {
            const errorText = await response.text();
            console.log(`Failed with ${endpoint}:`, response.status, errorText);
            lastError = `${response.status}: ${errorText}`;
          }
        } catch (err) {
          console.log(`Error with ${endpoint}:`, err.message);
          lastError = err.message;
          continue;
        }
      }

      if (!response || !response.ok) {
        throw new Error(lastError || "Semua endpoint API gagal");
      }

      const result = await response.json();
      console.log("Success result:", result);
      
      // Show approval popup instead of alert
      setShowApprovalPopup(true);
      
      // Reset form
      e.target.reset();
      setTickets([{ name: "", price: "" }]);
      setLocation("");
      setDescription("");
      setImageFile(null);
      setResetKey(prev => prev + 1);

    } catch (err) {
      console.error("Submit error:", err);
      alert(`Gagal menyimpan event: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseApprovalPopup = () => {
    setShowApprovalPopup(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 mt-15 text-gray-800 dark:text-gray-100">
      <div className="mb-10 bg-gradient-to-br from-[#FEE2E2] to-[#E0F2FE] dark:from-[#1e1e2e] dark:to-[#252836] rounded-xl p-6 flex items-center gap-4 shadow-lg">
        <img
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2RtbnZ4dGFjbGRpMm92bXkxbG1lZGtlcjdydHRlcWpxNTFrdThvYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3mxx8ey6aC2p2x7yWW/giphy.gif"
          alt="Funny Event"
          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700"
        />
        <div>
          <h2 className="text-xl font-bold text-[#474E93] dark:text-[#D5E7B5]">Punya acara seru?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Yuk, daftarkan eventmu sekarang juga dan biarkan semua orang tahu betapa serunya acara kamu!
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-[#474E93] dark:text-[#D5E7B5] mb-6">
        Buat Event Baru
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block font-semibold mb-1">Judul Event</label>
          <input
            name="title"
            type="text"
            className="w-full border border-[#7E5CAD] dark:border-[#72BAA9] bg-white dark:bg-[#1e1e2e] rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#72BAA9]"
            required
          />
        </div>

        {/* Location with Search */}
        <div className="relative">
          <label className="block font-semibold mb-1">Lokasi</label>
          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => handleLocationSearch(e.target.value)}
              onFocus={() => setShowLocationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
              placeholder="Ketik nama lokasi atau alamat..."
              className="w-full border border-[#7E5CAD] dark:border-[#72BAA9] bg-white dark:bg-[#1e1e2e] rounded px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-[#72BAA9]"
              required
            />
            <MapPin 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" 
              size={18} 
            />
            
            {/* Location Suggestions Dropdown */}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1e1e2e] border border-[#7E5CAD] dark:border-[#72BAA9] rounded-md shadow-lg max-h-60 overflow-y-auto">
                {locationSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleLocationSelect(suggestion)}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#252836] cursor-pointer text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="truncate">{suggestion.display_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block font-semibold mb-1">Tanggal</label>
          <div className="relative">
            <input
              ref={dateRef}
              type={dateType}
              placeholder="Pilih tanggal"
              onFocus={handleDateFocus}
              onBlur={handleDateBlur}
              className="w-full border border-[#7E5CAD] dark:border-[#72BAA9] bg-white dark:bg-[#1e1e2e] rounded px-3 py-2 pr-10 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#72BAA9]"
              required
            />
            {dateType === "text" && (
              <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 cursor-pointer"
                size={18}
                onClick={handleDateFocus}
              />
            )}
          </div>
        </div>

        {/* Upload File */}
        <div>
          <label className="block font-semibold mb-1">Gambar / Poster</label>
          <UploadFileInput 
            key={resetKey} 
            onFileSelect={setImageFile} 
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-[#7E5CAD] dark:border-[#72BAA9] bg-white dark:bg-[#1e1e2e] rounded px-3 py-2 resize-y min-h-[100px] outline-none focus:ring-2 focus:ring-[#72BAA9]"
            placeholder="Ceritakan tentang eventmu..."
            required
          />
        </div>

        {/* Tickets */}
        <div>
          <label className="block font-semibold mb-2">Tiket</label>
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Nama Tiket"
                  value={ticket.name}
                  onChange={(e) => handleTicketChange(index, "name", e.target.value)}
                  className="flex-1 border border-[#7E5CAD] dark:border-[#72BAA9] bg-white dark:bg-[#1e1e2e] rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#72BAA9]"
                  required
                />
                <input
                  type="text"
                  placeholder="Harga (Rp)"
                  value={formatRupiah(ticket.price)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    handleTicketChange(index, "price", raw);
                  }}
                  className="w-32 border border-[#7E5CAD] dark:border-[#72BAA9] bg-white dark:bg-[#1e1e2e] rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#72BAA9]"
                  required
                />
                {tickets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTicket(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddTicket}
            className="mt-2 text-sm flex items-center gap-1 text-[#7E5CAD] dark:text-[#D5E7B5] hover:underline"
          >
            <Plus size={16} /> Tambah Tiket
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#474E93] hover:bg-[#372f80] text-white font-semibold px-6 py-2 rounded transition dark:bg-[#72BAA9] dark:hover:bg-[#5da594] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Event"}
        </button>
      </form>

      {/* Approval Popup */}
      <ApprovalPopup 
        isOpen={showApprovalPopup} 
        onClose={handleCloseApprovalPopup} 
      />
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <CreateEventContent />
    </ProtectedRoute>
  );
}
