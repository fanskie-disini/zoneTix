// backend-api/routes/events.js
import express from "express";
import { eventService } from "../services/eventService.js";

const router = express.Router();

// GET /api/events - Get all events with optional limit
router.get("/", async (req, res) => {
  try {
    const { limit } = req.query;
    const events = await eventService.getEvents(limit ? parseInt(limit) : null);

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
});

// GET /api/events/latest - Get latest events
router.get("/latest", async (req, res) => {
  try {
    const { count = 4 } = req.query;
    const events = await eventService.getLatestEvents(parseInt(count));

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error("Error fetching latest events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest events",
      error: error.message,
    });
  }
});

// GET /api/events/:id - Get event by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's a numeric ID or slug
    if (isNaN(id)) {
      // It's a slug
      const event = await eventService.getEventBySlugSafe(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.json({
        success: true,
        data: event,
      });
    } else {
      // It's a numeric ID
      const event = await eventService.getEventById(parseInt(id));

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.json({
        success: true,
        data: event,
      });
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
});

// GET /api/events/:id/tickets - Get tickets for specific event
router.get("/:id/tickets", async (req, res) => {
  try {
    const { id } = req.params;
    const tickets = await eventService.getTicketsByEventId(id);

    res.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
});

// POST /api/events - Create new event
router.post("/", async (req, res) => {
  try {
    const eventData = req.body;

    // Validasi data yang diperlukan
    if (!eventData.title || !eventData.description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const newEvent = await eventService.createEvent(eventData);

    res.status(201).json({
      success: true,
      data: newEvent,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
});

// PUT /api/events/:id - Update event
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    const updatedEvent = await eventService.updateEvent(id, eventData);

    res.json({
      success: true,
      data: updatedEvent,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
});

// DELETE /api/events/:id - Delete event
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await eventService.deleteEvent(id);

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
});

export default router;
