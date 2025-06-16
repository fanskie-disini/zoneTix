// backend-api/routes/eventPending.js
import express from "express";
import { eventPendingService } from "../services/eventPendingService.js";

const router = express.Router();

// POST /api/events-pending - Submit event for approval
router.post("/", async (req, res) => {
  try {
    const eventData = req.body;

    // Validasi data yang diperlukan
    if (!eventData.title || !eventData.description || !eventData.organizer_id) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and organizer_id are required",
      });
    }

    const pendingEvent = await eventPendingService.submitEventForApproval(
      eventData
    );

    res.status(201).json({
      success: true,
      data: pendingEvent,
      message: "Event submitted for approval successfully",
    });
  } catch (error) {
    console.error("Error submitting event for approval:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit event for approval",
      error: error.message,
    });
  }
});

// GET /api/events-pending - Get all pending events with optional status filter
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const events = await eventPendingService.getAllPendingEvents(status);

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error("Error fetching pending events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending events",
      error: error.message,
    });
  }
});

// GET /api/events-pending/pending - Get only pending events (shortcut)
router.get("/pending", async (req, res) => {
  try {
    const events = await eventPendingService.getPendingEvents();

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error("Error fetching pending events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending events",
      error: error.message,
    });
  }
});

// GET /api/events-pending/organizer/:organizerId - Get events by organizer
router.get("/organizer/:organizerId", async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { status } = req.query;

    const events = await eventPendingService.getEventsByOrganizer(
      organizerId,
      status
    );

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error("Error fetching organizer events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch organizer events",
      error: error.message,
    });
  }
});

// GET /api/events-pending/:id - Get pending event by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventPendingService.getPendingEventById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Pending event not found",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching pending event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending event",
      error: error.message,
    });
  }
});

// PUT /api/events-pending/:id - Update pending event
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    const updatedEvent = await eventPendingService.updatePendingEvent(
      id,
      eventData
    );

    res.json({
      success: true,
      data: updatedEvent,
      message: "Pending event updated successfully",
    });
  } catch (error) {
    console.error("Error updating pending event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update pending event",
      error: error.message,
    });
  }
});

// POST /api/events-pending/:id/approve - Approve pending event
router.post("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { approved_by } = req.body;

    if (!approved_by) {
      return res.status(400).json({
        success: false,
        message: "approved_by is required",
      });
    }

    const approvedEvent = await eventPendingService.approveEvent(
      id,
      approved_by
    );

    res.json({
      success: true,
      data: approvedEvent,
      message: "Event approved successfully",
    });
  } catch (error) {
    console.error("Error approving event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve event",
      error: error.message,
    });
  }
});

// POST /api/events-pending/:id/reject - Reject pending event
router.post("/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { rejected_by, rejection_reason } = req.body;

    if (!rejected_by || !rejection_reason) {
      return res.status(400).json({
        success: false,
        message: "rejected_by and rejection_reason are required",
      });
    }

    const rejectedEvent = await eventPendingService.rejectEvent(
      id,
      rejected_by,
      rejection_reason
    );

    res.json({
      success: true,
      data: rejectedEvent,
      message: "Event rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject event",
      error: error.message,
    });
  }
});

// DELETE /api/events-pending/:id - Delete pending event
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await eventPendingService.deletePendingEvent(id);

    res.json({
      success: true,
      message: "Pending event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pending event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete pending event",
      error: error.message,
    });
  }
});

export default router;
