// backend-api/services/eventPendingService.js
import { supabase } from "../config/supabase.js";

export const eventPendingService = {
  // Submit event untuk approval
  async submitEventForApproval(eventData) {
    try {
      const { data, error } = await supabase
        .from("event_pending")
        .insert([
          {
            ...eventData,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error submitting event for approval:", error);
      throw error;
    }
  },

  // Get pending events (untuk admin)
  async getPendingEvents() {
    try {
      const { data, error } = await supabase
        .from("event_pending")
        .select(
          `
          *,
          organizer:users!event_pending_organizer_id_fkey(id, first_name, last_name, email)
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching pending events:", error);
      throw error;
    }
  },

  // Get all pending events dengan filter status
  async getAllPendingEvents(status = null) {
    try {
      let query = supabase
        .from("event_pending")
        .select(
          `
          *,
          organizer:users!event_pending_organizer_id_fkey(id, first_name, last_name, email),
          approved_by_user:users!event_pending_approved_by_fkey(id, first_name, last_name, email)
        `
        )
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching pending events:", error);
      throw error;
    }
  },

  // Get pending event by ID
  async getPendingEventById(id) {
    try {
      const { data, error } = await supabase
        .from("event_pending")
        .select(
          `
          *,
          organizer:users!event_pending_organizer_id_fkey(id, first_name, last_name, email),
          approved_by_user:users!event_pending_approved_by_fkey(id, first_name, last_name, email)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error fetching pending event:", error);
      throw error;
    }
  },

  // Approve event - move to main events table
  async approveEvent(pendingEventId, approvedBy) {
    try {
      // Get pending event
      const pendingEvent = await this.getPendingEventById(pendingEventId);

      if (!pendingEvent) {
        throw new Error("Pending event not found");
      }

      if (pendingEvent.status !== "pending") {
        throw new Error("Event is not in pending status");
      }

      // Start transaction
      const { data: approvedEvent, error: insertError } = await supabase
        .from("events")
        .insert([
          {
            title: pendingEvent.title,
            description: pendingEvent.description,
            location: pendingEvent.location,
            date: pendingEvent.date,
            image_url: pendingEvent.image_url,
            organizer_id: pendingEvent.organizer_id,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting approved event:", insertError.message);
        throw new Error(insertError.message);
      }

      // Update pending event status
      const { error: updateError } = await supabase
        .from("event_pending")
        .update({
          status: "approved",
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        })
        .eq("id", pendingEventId);

      if (updateError) {
        console.error("Error updating pending event:", updateError.message);
        throw new Error(updateError.message);
      }

      return approvedEvent;
    } catch (error) {
      console.error("Error approving event:", error);
      throw error;
    }
  },

  // Reject event
  async rejectEvent(pendingEventId, rejectedBy, rejectionReason) {
    try {
      const { data, error } = await supabase
        .from("event_pending")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          approved_by: rejectedBy,
          approved_at: new Date().toISOString(),
        })
        .eq("id", pendingEventId)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error rejecting event:", error);
      throw error;
    }
  },

  // Get events by organizer
  async getEventsByOrganizer(organizerId, status = null) {
    try {
      let query = supabase
        .from("event_pending")
        .select(
          `
          *,
          approved_by_user:users!event_pending_approved_by_fkey(id, first_name, last_name, email)
        `
        )
        .eq("organizer_id", organizerId)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching organizer events:", error);
      throw error;
    }
  },

  // Update pending event
  async updatePendingEvent(id, eventData) {
    try {
      // Only allow updates if status is pending
      const existingEvent = await this.getPendingEventById(id);

      if (existingEvent.status !== "pending") {
        throw new Error("Cannot update event that is not in pending status");
      }

      const { data, error } = await supabase
        .from("event_pending")
        .update({
          ...eventData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error updating pending event:", error);
      throw error;
    }
  },

  // Delete pending event (only if pending)
  async deletePendingEvent(id) {
    try {
      const existingEvent = await this.getPendingEventById(id);

      if (existingEvent.status !== "pending") {
        throw new Error("Cannot delete event that is not in pending status");
      }

      const { error } = await supabase
        .from("event_pending")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting pending event:", error);
      throw error;
    }
  },
};
