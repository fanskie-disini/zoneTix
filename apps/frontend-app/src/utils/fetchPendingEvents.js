// utils/fetchPendingEvents.js
import { supabase } from "@/lib/supabase";

/**
 * Fetch all pending events from event_pending table
 */
export async function fetchPendingEvents() {
  try {
    const { data, error } = await supabase
      .from("event_pending")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending events:", error);
      throw error;
    }

    // Parse tickets JSON for each event
    const eventsWithParsedTickets = data.map((event) => ({
      ...event,
      tickets:
        typeof event.tickets === "string"
          ? JSON.parse(event.tickets)
          : event.tickets || [],
    }));

    return eventsWithParsedTickets;
  } catch (error) {
    console.error("Error in fetchPendingEvents:", error);
    throw error;
  }
}

/**
 * Approve a pending event - move from event_pending to events table
 */
export async function approvePendingEvent(eventId, adminNotes = "") {
  try {
    // First, get the pending event
    const { data: pendingEvent, error: fetchError } = await supabase
      .from("event_pending")
      .select("*")
      .eq("id", eventId)
      .single();

    if (fetchError) {
      console.error("Error fetching pending event:", fetchError);
      throw fetchError;
    }

    if (!pendingEvent) {
      throw new Error("Pending event not found");
    }

    // Create the approved event object
    const approvedEvent = {
      title: pendingEvent.title,
      location: pendingEvent.location,
      date: pendingEvent.date,
      image_url: pendingEvent.image_url,
      description: pendingEvent.description,
      created_at: new Date().toISOString(),
    };

    // Insert into events table
    const { data: newEvent, error: insertError } = await supabase
      .from("events")
      .insert([approvedEvent])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting approved event:", insertError);
      throw insertError;
    }

    // Parse and insert tickets
    const tickets =
      typeof pendingEvent.tickets === "string"
        ? JSON.parse(pendingEvent.tickets)
        : pendingEvent.tickets || [];

    if (tickets.length > 0) {
      const ticketsToInsert = tickets.map((ticket) => ({
        event_id: newEvent.id,
        name: ticket.name,
        price: ticket.price,
        created_at: new Date().toISOString(),
      }));

      const { error: ticketsError } = await supabase
        .from("tickets")
        .insert(ticketsToInsert);

      if (ticketsError) {
        console.error("Error inserting tickets:", ticketsError);
        // Don't throw here, event is already created
      }
    }

    // Update pending event status
    const { error: updateError } = await supabase
      .from("event_pending")
      .update({
        status: "approved",
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        approved_at: new Date().toISOString(),
        rejection_reason: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (updateError) {
      console.error("Error updating pending event status:", updateError);
      // Don't throw here, event is already approved
    }

    return newEvent;
  } catch (error) {
    console.error("Error in approvePendingEvent:", error);
    throw error;
  }
}

/**
 * Reject a pending event
 */
export async function rejectPendingEvent(eventId, rejectionReason = "") {
  try {
    const { error } = await supabase
      .from("event_pending")
      .update({
        status: "rejected",
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (error) {
      console.error("Error rejecting pending event:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in rejectPendingEvent:", error);
    throw error;
  }
}

/**
 * Delete a pending event completely
 */
export async function deletePendingEvent(eventId) {
  try {
    const { error } = await supabase
      .from("event_pending")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Error deleting pending event:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deletePendingEvent:", error);
    throw error;
  }
}
