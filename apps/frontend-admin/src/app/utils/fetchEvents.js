// frontend-app/utils/fetchEvents.js dan frontend-admin/utils/fetchEvents.js

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const fetchEvents = {
  // Get all events dengan optional limit
  async getEvents(limit = null) {
    try {
      const url = new URL(`${API_BASE_URL}/events`);
      if (limit) {
        url.searchParams.append("limit", limit.toString());
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch events");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  },

  // Get latest events (untuk homepage)
  async getLatestEvents(count = 4) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/events/latest?count=${count}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch latest events");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching latest events:", error);
      return [];
    }
  },

  // Get all events (untuk halaman /event)
  async getAllEvents() {
    return await this.getEvents();
  },

  // Get event by ID or slug
  async getEventById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch event");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching event:", error);
      return null;
    }
  },

  // Get event by slug (alias untuk getEventById)
  async getEventBySlug(slug) {
    return await this.getEventById(slug);
  },

  // Get tickets by event ID
  async getTicketsByEventId(eventId) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/tickets`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch tickets");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return [];
    }
  },

  // Create new event (untuk admin)
  async createEvent(eventData) {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create event");
      }

      return data.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  // Update event (untuk admin)
  async updateEvent(id, eventData) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update event");
      }

      return data.data;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  // Delete event (untuk admin)
  async deleteEvent(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to delete event");
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};

// Helper function untuk slugify (jika diperlukan di frontend)
export const slugify = (text) => {
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

// Backwards compatibility - export individual functions
export const {
  getEvents,
  getLatestEvents,
  getAllEvents,
  getEventById,
  getEventBySlug,
  getTicketsByEventId,
  createEvent,
  updateEvent,
  deleteEvent,
} = fetchEvents;
