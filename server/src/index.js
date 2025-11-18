// server/src/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import visitRoutes from './routes/visitRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/locations', locationRoutes);

// Root route for status check
app.get("/", (req, res) => {
  res.json({
    message: "MissionConnect API is running 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      contacts: "/api/contacts",
      visits: "/api/visits",
      locations: "/api/locations"
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
