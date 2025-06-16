// File: apps/frontend-admin/src/app/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Filter,
  Search,
} from "lucide-react";

const AdminEventApproval = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample data - dalam implementasi nyata, data ini dari API
  const sampleEvents = [
    {
      id: 1,
      title: "Konser Musik Indie Jakarta",
      description:
        "Konser musik indie terbesar di Jakarta dengan lineup artis lokal terbaik",
      organizer: "PT Musik Nusantara",
      organizerEmail: "contact@musiknusantara.com",
      date: "2025-07-15",
      time: "19:00",
      location: "Jakarta Convention Center",
      price: 150000,
      capacity: 2000,
      category: "Music",
      status: "pending",
      submittedAt: "2025-06-10T10:30:00Z",
      image:
        "https://via.placeholder.com/400x300/4F46E5/ffffff?text=Music+Concert",
      vendorId: 101,
    },
    {
      id: 2,
      title: "Workshop Digital Marketing",
      description: "Pelatihan digital marketing untuk UMKM dan startup",
      organizer: "Digital Academy",
      organizerEmail: "info@digitalacademy.id",
      date: "2025-07-20",
      time: "09:00",
      location: "Gedung Sate, Bandung",
      price: 250000,
      capacity: 100,
      category: "Workshop",
      status: "approved",
      submittedAt: "2025-06-08T14:20:00Z",
      image:
        "https://via.placeholder.com/400x300/059669/ffffff?text=Digital+Workshop",
      vendorId: 102,
    },
    {
      id: 3,
      title: "Festival Kuliner Nusantara",
      description:
        "Festival kuliner tradisional dari berbagai daerah di Indonesia",
      organizer: "Komunitas Kuliner",
      organizerEmail: "hello@komunitaskuliner.id",
      date: "2025-08-01",
      time: "10:00",
      location: "Taman Mini Indonesia Indah",
      price: 50000,
      capacity: 5000,
      category: "Food",
      status: "rejected",
      submittedAt: "2025-06-05T09:15:00Z",
      image:
        "https://via.placeholder.com/400x300/DC2626/ffffff?text=Food+Festival",
      vendorId: 103,
      rejectionReason: "Lokasi tidak sesuai dengan regulasi keamanan",
    },
    {
      id: 4,
      title: "Seminar Teknologi AI",
      description: "Diskusi mendalam tentang perkembangan AI di Indonesia",
      organizer: "Tech Community",
      organizerEmail: "contact@techcommunity.id",
      date: "2025-07-25",
      time: "13:00",
      location: "Universitas Indonesia, Depok",
      price: 100000,
      capacity: 300,
      category: "Technology",
      status: "pending",
      submittedAt: "2025-06-12T16:45:00Z",
      image:
        "https://via.placeholder.com/400x300/7C3AED/ffffff?text=AI+Seminar",
      vendorId: 104,
    },
  ];

  useEffect(() => {
    setEvents(sampleEvents);
    setFilteredEvents(sampleEvents);
  }, []);

  useEffect(() => {
    let filtered = events;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((event) => event.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [selectedStatus, searchTerm, events]);

  const handleApprove = async (eventId) => {
    setLoading(true);
    // Simulasi API call
    setTimeout(() => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                status: "approved",
                approvedAt: new Date().toISOString(),
              }
            : event
        )
      );
      setLoading(false);
      setShowModal(false);
      setSelectedEvent(null);
    }, 1000);
  };

  const handleReject = async (eventId, reason) => {
    setLoading(true);
    // Simulasi API call
    setTimeout(() => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                status: "rejected",
                rejectionReason: reason,
                rejectedAt: new Date().toISOString(),
              }
            : event
        )
      );
      setLoading(false);
      setShowModal(false);
      setSelectedEvent(null);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const pendingCount = events.filter((e) => e.status === "pending").length;
  const approvedCount = events.filter((e) => e.status === "approved").length;
  const rejectedCount = events.filter((e) => e.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Event Management
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                Selamat datang, <span className="font-medium">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Events
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rejectedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-gray-400 mr-2" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari event, organizer, atau kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Event Submissions ({filteredEvents.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {getStatusIcon(event.status)}
                          <span className="ml-1 capitalize">
                            {event.status}
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {event.organizer}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(event.date).toLocaleDateString(
                            "id-ID"
                          )} at {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Rp {event.price.toLocaleString("id-ID")}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Kapasitas: {event.capacity} orang
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-2">
                        {event.description}
                      </p>

                      <div className="text-xs text-gray-500">
                        Submitted:{" "}
                        {new Date(event.submittedAt).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>

                      {event.status === "rejected" && event.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <strong>Alasan Penolakan:</strong>{" "}
                          {event.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </button>

                    {event.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(event.id)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowModal(true);
                          }}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada event ditemukan
                </h3>
                <p className="text-gray-600">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Event Details and Actions */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detail Event
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-48 object-cover rounded-lg"
                />

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedEvent.title}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {selectedEvent.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Organizer:
                      </span>
                      <p className="text-gray-600">{selectedEvent.organizer}</p>
                      <p className="text-gray-600">
                        {selectedEvent.organizerEmail}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Kategori:
                      </span>
                      <p className="text-gray-600">{selectedEvent.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Tanggal & Waktu:
                      </span>
                      <p className="text-gray-600">
                        {new Date(selectedEvent.date).toLocaleDateString(
                          "id-ID"
                        )}{" "}
                        - {selectedEvent.time}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Lokasi:</span>
                      <p className="text-gray-600">{selectedEvent.location}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Harga Tiket:
                      </span>
                      <p className="text-gray-600">
                        Rp {selectedEvent.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Kapasitas:
                      </span>
                      <p className="text-gray-600">
                        {selectedEvent.capacity} orang
                      </p>
                    </div>
                  </div>
                </div>

                {selectedEvent.status === "pending" && (
                  <div className="border-t pt-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(selectedEvent.id)}
                        disabled={loading}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {loading ? "Processing..." : "Approve Event"}
                      </button>
                      <RejectButton
                        onReject={(reason) =>
                          handleReject(selectedEvent.id, reason)
                        }
                        loading={loading}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Komponen terpisah untuk tombol reject dengan form alasan
const RejectButton = ({ onReject, loading }) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason);
      setRejectionReason("");
      setShowRejectForm(false);
    }
  };

  if (showRejectForm) {
    return (
      <div className="flex-1 space-y-2">
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Masukkan alasan penolakan..."
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          rows="3"
        />
        <div className="flex space-x-2">
          <button
            onClick={handleReject}
            disabled={loading || !rejectionReason.trim()}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Reject"}
          </button>
          <button
            onClick={() => {
              setShowRejectForm(false);
              setRejectionReason("");
            }}
            className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowRejectForm(true)}
      disabled={loading}
      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
    >
      <XCircle className="w-4 h-4 mr-2" />
      Reject Event
    </button>
  );
};

export default AdminEventApproval;
