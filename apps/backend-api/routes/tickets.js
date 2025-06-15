import express from "express";
import supabase from "../supabase/client.js"; // Perlu .js di akhir

const router = express.Router();

// GET all tickets
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("tickets")
    .select("*, events(title, date, location)");

  if (error) return res.status(500).json({ error });
  res.json(data);
});

export default router;
