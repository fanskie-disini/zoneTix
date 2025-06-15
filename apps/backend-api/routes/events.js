import express from "express";
const router = express.Router();
import supabase from "../supabase/client.js";

// POST /api/events
router.post("/", async (req, res) => {
  const { title, location, date, imageUrl, description, tickets } = req.body;

  // Insert event terlebih dahulu
  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert([{ title, location, date, image_url: imageUrl, description }])
    .select()
    .single();

  if (eventError) return res.status(500).json({ error: eventError.message });

  // Insert tiket terkait event
  const ticketsWithEventId = tickets.map((t) => ({
    ...t,
    event_id: event.id,
  }));

  const { error: ticketError } = await supabase
    .from("tickets")
    .insert(ticketsWithEventId);

  if (ticketError) return res.status(500).json({ error: ticketError.message });

  res.status(200).json({ success: true, event });
});

export default router;
