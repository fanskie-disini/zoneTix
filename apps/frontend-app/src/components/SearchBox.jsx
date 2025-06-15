'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/utils/slugify';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const searchBoxRef = useRef(null);
  const router = useRouter();

  // Handle search logic
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length > 1) {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Handle different response formats
          if (data.success !== undefined) {
            // If API returns { success: true, data: [...] }
            setResults(data.success ? (data.data || []) : []);
          } else if (Array.isArray(data)) {
            // If API returns array directly
            setResults(data);
          } else {
            // If API returns object with results property
            setResults(data.results || data.events || []);
          }
          
          setShowResults(true);
        } catch (err) {
          console.error('Search error:', err);
          setError('Terjadi kesalahan saat mencari');
          setResults([]);
          setShowResults(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        setShowResults(false);
        setResults([]);
        setError(null);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle result item click
  const handleResultClick = (event) => {
    const slug = event.slug || slugify(event.title || event.name);
    setQuery('');
    setShowResults(false);
    router.push(`/event/${slug}`);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setQuery('');
    setShowResults(false);
    setResults([]);
    setError(null);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0]);
    }
    if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={searchBoxRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => query.length > 1 && setShowResults(true)}
          className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 bg-[#f0f9e0] focus:ring-[#72BAA9] focus:border-transparent text-[#474E93] placeholder-gray-500 transition-all duration-200"
          placeholder="Cari event di sini ..."
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden"
          >
            {/* Results Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  {isLoading ? 'Mencari...' : 'Hasil Pencarian'}
                </h3>
                {!isLoading && results.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {results.length} hasil
                  </span>
                )}
              </div>
              <div className="w-12 h-1 bg-[#72BAA9] mt-2 rounded-full"></div>
            </div>

            {/* Results Content */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#72BAA9]"></div>
                  <p className="mt-2 text-sm text-gray-500">Mencari event...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-red-500">{error}</p>
                  <button
                    onClick={() => setQuery(query + ' ')} // Trigger re-search
                    className="mt-2 text-xs text-[#72BAA9] hover:underline"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : results.length > 0 ? (
                results.map((event, index) => (
                  <motion.div
                    key={event.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 group"
                    onClick={() => handleResultClick(event)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Event Image/Icon */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#72BAA9] to-[#474E93] rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {(event.title || event.name || 'E').charAt(0)}
                        </span>
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 group-hover:text-[#474E93] transition-colors line-clamp-1">
                          {event.title || event.name || 'Event Tanpa Judul'}
                        </p>
                        
                        {/* Location */}
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 line-clamp-1">
                            {event.location || event.venue || 'Lokasi tidak diketahui'}
                          </span>
                        </div>
                        
                        {/* Date */}
                        {event.date && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(event.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Tidak ada hasil untuk "{query}"
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Coba gunakan kata kunci yang berbeda
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}