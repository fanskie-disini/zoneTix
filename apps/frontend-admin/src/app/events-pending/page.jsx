// src/app/admin/events/page.jsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email';

export default function AdminEventsDashboard() {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const approveEvent = async (event) => {
    try {
      // 1. Pindahkan event dari pending ke approved
      const { error: insertError } = await supabase
        .from('events')
        .insert({
          ...event,
          approved_at: new Date().toISOString(),
          status: 'approved'
        });

      if (insertError) throw insertError;

      // 2. Hapus dari pending
      const { error: deleteError } = await supabase
        .from('events_pending')
        .delete()
        .eq('id', event.id);

      if (deleteError) throw deleteError;

      // 3. Kirim email
      await sendApprovalEmail(event.organizerEmail, event.title);
      
      toast.success('Event approved dan notifikasi terkirim!');
      fetchEvents(); // Refresh data
    } catch (error) {
      toast.error(`Gagal approve: ${error.message}`);
    }
  };

  const rejectEvent = async (eventId, reason) => {
    try {
      // 1. Ambil data event
      const { data: eventData, error: fetchError } = await supabase
        .from('events_pending')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Pindahkan ke rejected
      const { error: insertError } = await supabase
        .from('events_rejected')
        .insert({
          ...eventData,
          rejected_at: new Date().toISOString(),
          status: 'rejected',
          admin_notes: reason
        });

      if (insertError) throw insertError;

      // 3. Hapus dari pending
      const { error: deleteError } = await supabase
        .from('events_pending')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;

      // 4. Kirim email
      await sendRejectionEmail(eventData.organizerEmail, eventData.title, reason);
      
      toast.success('Event rejected dan notifikasi terkirim!');
      fetchEvents(); // Refresh data
    } catch (error) {
      toast.error(`Gagal reject: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch pending events
      const { data: pendingData } = await supabase
        .from("events_pending")
        .select("*")
        .order("submitted_at", { ascending: false });
      
      // Fetch approved events
      const { data: approvedData } = await supabase
        .from("events")
        .select("*")
        .order("approved_at", { ascending: false });
      
      // Fetch rejected events
      const { data: rejectedData } = await supabase
        .from("events_rejected")
        .select("*")
        .order("rejected_at", { ascending: false });

      setPendingEvents(pendingData || []);
      setApprovedEvents(approvedData || []);
      setRejectedEvents(rejectedData || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Gagal memuat data event");
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (event) => {
    try {
      // Insert to approved events table
      const { error: insertError } = await supabase
        .from("events")
        .insert({
          ...event,
          approved_at: new Date().toISOString(),
          status: "approved",
          admin_notes: null
        });
      
      if (insertError) throw insertError;

      // Remove from pending table
      const { error: deleteError } = await supabase
        .from("events_pending")
        .delete()
        .eq("id", event.id);
      
      if (deleteError) throw deleteError;

      // Refresh data
      await fetchEvents();
      
      toast.success("Event berhasil disetujui!");
      
      // TODO: Send approval email to organizer
    } catch (error) {
      console.error("Error approving event:", error);
      toast.error("Gagal menyetujui event");
    }
  };

  const rejectEvent = async (eventId, reason) => {
    try {
      // Get the event first
      const { data: eventData, error: fetchError } = await supabase
        .from("events_pending")
        .select("*")
        .eq("id", eventId)
        .single();
      
      if (fetchError) throw fetchError;

      // Insert to rejected events table
      const { error: insertError } = await supabase
        .from("events_rejected")
        .insert({
          ...eventData,
          rejected_at: new Date().toISOString(),
          status: "rejected",
          admin_notes: reason
        });
      
      if (insertError) throw insertError;

      // Remove from pending table
      const { error: deleteError } = await supabase
        .from("events_pending")
        .delete()
        .eq("id", eventId);
      
      if (deleteError) throw deleteError;

      // Refresh data
      await fetchEvents();
      
      toast.success("Event berhasil ditolak!");
      
      // TODO: Send rejection email to organizer with reason
    } catch (error) {
      console.error("Error rejecting event:", error);
      toast.error("Gagal menolak event");
    }
  };

  const renderEventCard = (event, status) => (
    <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{event.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
            Oleh: {event.organizer} ({event.organizerEmail})
          </p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === "approved" ? "bg-green-100 text-green-800" :
          status === "rejected" ? "bg-red-100 text-red-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {status === "approved" ? "Disetujui" : 
           status === "rejected" ? "Ditolak" : "Menunggu"}
        </span>
      </div>
      
      <div className="mt-2 text-sm">
        <p><span className="font-semibold">Lokasi:</span> {event.location}</p>
        <p><span className="font-semibold">Tanggal:</span> {new Date(event.date).toLocaleDateString("id-ID")}</p>
        <p><span className="font-semibold">Diajukan pada:</span> {new Date(event.submitted_at).toLocaleString("id-ID")}</p>
        
        {event.admin_notes && (
          <p className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <span className="font-semibold">Catatan Admin:</span> {event.admin_notes}
          </p>
        )}
        
        {event.tickets && event.tickets.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">Tiket:</p>
            <ul className="list-disc pl-5">
              {event.tickets.map((ticket, idx) => (
                <li key={idx}>
                  {ticket.name} - Rp{ticket.price.toLocaleString("id-ID")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {status === "pending" && (
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => {
              const reason = prompt("Masukkan alasan penolakan (opsional):");
              if (reason !== null) {
                rejectEvent(event.id, reason);
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Tolak
          </button>
          <button
            onClick={() => approveEvent(event)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Setujui
          </button>
        </div>
      )}
    </div>
  );

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard - Approval Event</h1>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium ${activeTab === "pending" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("pending")}
            >
              Menunggu ({pendingEvents.length})
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "approved" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("approved")}
            >
              Disetujui ({approvedEvents.length})
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "rejected" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("rejected")}
            >
              Ditolak ({rejectedEvents.length})
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <p>Memuat data...</p>
          </div>
        ) : (
          <div>
            {activeTab === "pending" && (
              <div>
                {pendingEvents.length === 0 ? (
                  <p className="text-center py-10 text-gray-500">Tidak ada event yang menunggu approval</p>
                ) : (
                  pendingEvents.map(event => renderEventCard(event, "pending"))
                )}
              </div>
            )}
            
            {activeTab === "approved" && (
              <div>
                {approvedEvents.length === 0 ? (
                  <p className="text-center py-10 text-gray-500">Belum ada event yang disetujui</p>
                ) : (
                  approvedEvents.map(event => renderEventCard(event, "approved"))
                )}
              </div>
            )}
            
            {activeTab === "rejected" && (
              <div>
                {rejectedEvents.length === 0 ? (
                  <p className="text-center py-10 text-gray-500">Belum ada event yang ditolak</p>
                ) : (
                  rejectedEvents.map(event => renderEventCard(event, "rejected"))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedAdminRoute>
  );
}