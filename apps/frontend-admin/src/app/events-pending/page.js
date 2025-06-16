// =============================================================================
// FILE: frontend-admin/src/app/events-pending/page.js (COMPLETE VERSION)
// =============================================================================

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
  Trash2,
  AlertCircle,
  X,
} from "lucide-react";

export default function EventsPendingPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingEvents();
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
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [selectedStatus, searchTerm, events]);

  const fetchPendingEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events-pending");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setFilteredEvents(data);
      } else {
        throw new Error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching pending events:", error);
      alert("Gagal memuat data events");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    if (!confirm("Apakah Anda yakin ingin menyetujui event ini?")) return;

    setActionLoading(eventId);
    try {
      const response = await fetch(`/api/events-pending/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
          approved_by: "admin",
        }),
      });

      if (response.ok) {
        alert("Event berhasil disetujui!");
        fetchPendingEvents();
        setShowModal(false);
        setSelectedEvent(null);
      } else {
        const errorData = await response.json();
        alert(`Gagal menyetujui event: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error approving event:", error);
      alert("Terjadi kesalahan saat menyetujui event!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId, reason) => {
    if (!reason || !reason.trim()) {
      alert("Alasan penolakan harus diisi!");
      return;
    }

    setActionLoading(eventId);
    try {
      const response = await fetch(`/api/events-pending/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reject",
          rejection_reason: reason,
          approved_by: "admin",
        }),
      });

      if (response.ok) {
        alert("Event berhasil ditolak!");
        fetchPendingEvents();
        setShowModal(false);
        setSelectedEvent(null);
      } else {
        const errorData = await response.json();
        alert(`Gagal menolak event: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error rejecting event:", error);
      alert("Terjadi kesalahan saat menolak event!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (eventId) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan."
      )
    )
      return;

    setActionLoading(eventId);
    try {
      const response = await fetch(`/api/events-pending/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Event berhasil dihapus!");
        fetchPendingEvents();
        setShowModal(false);
        setSelectedEvent(null);
      } else {
        const errorData = await response.json();
        alert(`Gagal menghapus event: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Terjadi kesalahan saat menghapus event!");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                  placeholder="Cari event..."
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
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/80x80/e5e7eb/9ca3af?text=No+Image";
                        }}
                      />
                    )}
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
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="text-xs text-gray-500">
                        Submitted:{" "}
                        {new Date(event.created_at).toLocaleDateString(
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

                      {event.status === "rejected" &&
                        event.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <div className="flex items-start">
                              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>Alasan Penolakan:</strong>{" "}
                                {event.rejection_reason}
                              </div>
                            </div>
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
                      <button
                        onClick={() => handleApprove(event.id)}
                        disabled={actionLoading === event.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {actionLoading === event.id
                          ? "Processing..."
                          : "Approve"}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={actionLoading === event.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && !loading && (
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
        <EventDetailModal
          event={selectedEvent}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          loading={actionLoading === selectedEvent.id}
          formatDate={formatDate}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
}

// Komponen Modal untuk Detail Event
const EventDetailModal = ({
  event,
  onClose,
  onApprove,
  onReject,
  onDelete,
  loading,
  formatDate,
  formatPrice,
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(event.id, rejectionReason);
      setRejectionReason("");
      setShowRejectForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Detail Event</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {event.image_url && (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x200/e5e7eb/9ca3af?text=No+Image";
                }}
              />
            )}

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {event.title}
              </h4>
              <p className="text-gray-600 mb-4">{event.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Tanggal:</span>
                  <p className="text-gray-600">{formatDate(event.date)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Lokasi:</span>
                  <p className="text-gray-600">{event.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-gray-600 capitalize">{event.status}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Organizer ID:
                  </span>
                  <p className="text-gray-600">{event.organizer_id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dibuat:</span>
                  <p className="text-gray-600">
                    {new Date(event.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                {event.approved_at && (
                  <div>
                    <span className="font-medium text-gray-700">Diproses:</span>
                    <p className="text-gray-600">
                      {new Date(event.approved_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                )}
              </div>

              {/* Tickets */}
              {event.tickets && event.tickets.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Tiket:</span>
                  <div className="mt-2 space-y-2">
                    {event.tickets.map((ticket, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-600">
                          {ticket.name}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(ticket.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {event.status === "rejected" && event.rejection_reason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <span className="font-medium text-red-800">
                    Alasan Penolakan:
                  </span>
                  <p className="text-red-700 mt-1">{event.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Reject Form */}
            {showRejectForm && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penolakan:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Masukkan alasan penolakan..."
                />
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason("");
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || loading}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Tolak Event"}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              {event.status === "pending" && (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={loading || showRejectForm}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => onApprove(event.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Setujui"}
                  </button>
                </>
              )}
              <button
                onClick={() => onDelete(event.id)}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
