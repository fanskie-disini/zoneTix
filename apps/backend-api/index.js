import "dotenv/config";
import express from "express";
import cors from "cors";
import ticketsRouter from "./routes/tickets.js"; // Perlu .js di akhir!
import eventsRouter from "./routes/events.js"

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/tickets", ticketsRouter);
app.use("/api/events", eventsRouter);

// Root test route
app.get("/", (req, res) => {
    res.send("✅ Backend berjalan dan terhubung ke Supabase!");
  });

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
