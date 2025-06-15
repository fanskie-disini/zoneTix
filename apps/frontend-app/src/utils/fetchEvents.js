import { supabase } from "@/lib/supabase";
import { slugify } from "./slugify";

export const getEvents = async (limit = null) => {
  let query = supabase
    .from("events")
    // Gunakan foreign key yang eksplisit untuk menghindari ambiguitas
    .select("*, tickets!tickets_event_id_fkey(*)")
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error.message);
    return [];
  }

  return data || [];
};

// Alternative solution - menggunakan inner join eksplisit
export const getEventsAlternative = async (limit = null) => {
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
    return [];
  }

  return data || [];
};

// Solusi ketiga - fetch terpisah jika relasi masih bermasalah
export const getEventsWithTicketsSeparate = async (limit = null) => {
  // Pertama ambil events
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
    return [];
  }

  if (!events || events.length === 0) {
    return [];
  }

  // Kemudian ambil tickets untuk semua events
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
};

// helper
export const getTicketsByEventId = async (id) => {
  try {
    const res = await fetch(`/api/events/${id}/tickets`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Failed to fetch tickets:", err);
    return [];
  }
};

// Fungsi khusus untuk mendapatkan event terbaru (untuk homepage)
export const getLatestEvents = async (count = 4) => {
  return await getEvents(count);
};

// Fungsi untuk mendapatkan semua event (untuk halaman /event)
export const getAllEvents = async () => {
  return await getEvents();
};

// Slug - dengan explicit foreign key
export const getEventBySlug = async (slug) => {
  const { data, error } = await supabase
    .from("events")
    .select("*, tickets!tickets_event_id_fkey(*)");

  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }

  // Temukan event berdasarkan slug hasil dari title
  const event = data?.find((event) => slugify(event.title) === slug);
  return event || null;
};

// Alternative getEventBySlug dengan fetch terpisah
export const getEventBySlugSafe = async (slug) => {
  // Ambil semua events terlebih dahulu
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*");

  if (eventsError) {
    console.error("Supabase error:", eventsError.message);
    return null;
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
};
