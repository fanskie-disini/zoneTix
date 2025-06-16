// backend-api/services/eventService.js
import { supabase } from "../config/supabase.js";

// Helper function untuk slugify
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const eventService = {
  // Get all events dengan optional limit
  async getEvents(limit = null) {
    try {
      let query = supabase
        .from("events")
        .select("*, tickets!tickets_event_id_fkey(*)")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  // Alternative method dengan explicit select
  async getEventsAlternative(limit = null) {
    try {
      let query = supabase
        .from("events")
        .select(
          `
          *,
          tickets (
            id,
            event_id,
            name,
            price,
            quantity,
            description,
            created_at
          )
        `
        )
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  // Method dengan fetch terpisah untuk menghindari masalah relasi
  async getEventsWithTicketsSeparate(limit = null) {
    try {
      // Ambil events terlebih dahulu
      let eventsQuery = supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (limit) {
        eventsQuery = eventsQuery.limit(limit);
      }

      const { data: events, error: eventsError } = await eventsQuery;

      if (eventsError) {
        console.error("Supabase error:", eventsError.message);
        throw new Error(eventsError.message);
      }

      if (!events || events.length === 0) {
        return [];
      }

      // Ambil tickets untuk semua events
      const eventIds = events.map((event) => event.id);
      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .in("event_id", eventIds);

      if (ticketsError) {
        console.error("Tickets error:", ticketsError.message);
        // Return events tanpa tickets jika ada error
        return events.map((event) => ({ ...event, tickets: [] }));
      }

      // Gabungkan events dengan tickets
      const eventsWithTickets = events.map((event) => {
        const eventTickets =
          tickets?.filter((ticket) => ticket.event_id === event.id) || [];
        return {
          ...event,
          tickets: eventTickets,
        };
      });

      return eventsWithTickets;
    } catch (error) {
      console.error("Error fetching events with tickets:", error);
      throw error;
    }
  },

  // Get event by ID
  async getEventById(id) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, tickets!tickets_event_id_fkey(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      throw error;
    }
  },

  // Get event by slug
  async getEventBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, tickets!tickets_event_id_fkey(*)");

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      // Temukan event berdasarkan slug hasil dari title
      const event = data?.find((event) => slugify(event.title) === slug);
      return event || null;
    } catch (error) {
      console.error("Error fetching event by slug:", error);
      throw error;
    }
  },

  // Safe version of getEventBySlug dengan fetch terpisah
  async getEventBySlugSafe(slug) {
    try {
      // Ambil semua events terlebih dahulu
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*");

      if (eventsError) {
        console.error("Supabase error:", eventsError.message);
        throw new Error(eventsError.message);
      }

      // Temukan event berdasarkan slug
      const event = events?.find((event) => slugify(event.title) === slug);

      if (!event) {
        return null;
      }

      // Ambil tickets untuk event ini
      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .eq("event_id", event.id);

      if (ticketsError) {
        console.error("Tickets error:", ticketsError.message);
        return { ...event, tickets: [] };
      }

      return {
        ...event,
        tickets: tickets || [],
      };
    } catch (error) {
      console.error("Error fetching event by slug safe:", error);
      throw error;
    }
  },

  // Get tickets by event ID
  async getTicketsByEventId(eventId) {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("event_id", eventId);

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  },

  // Get latest events (untuk homepage)
  async getLatestEvents(count = 4) {
    return await this.getEvents(count);
  },

  // Get all events (untuk halaman /event)
  async getAllEvents() {
    return await this.getEvents();
  },

  // Create new event
  async createEvent(eventData) {
    try {
      const { data, error } = await supabase
        .from("events")
        .insert([eventData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  // Update event
  async updateEvent(id, eventData) {
    try {
      const { data, error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  // Delete event
  async deleteEvent(id) {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) {
        console.error("Supabase error:", error.message);
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};
