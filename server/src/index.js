// server/src/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import visitRoutes from './routes/visitRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import noteRoutes from './routes/noteRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// CORS configuration - Allow all requests
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization', 'Content-Type'],
  credentials: false, // Must be false when origin is '*'
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Health check endpoint - Public access
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notes', noteRoutes);

// Root route for status check - Public access
app.get("/", (req, res) => {
  console.log('Root route accessed');
  res.status(200).json({
    message: "MissionConnect API is running 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      contacts: "/api/contacts",
      visits: "/api/visits",
      locations: "/api/locations",
      notes: "/api/notes"
    },
    cors: "enabled",
    access: "public",
    timestamp: new Date().toISOString()
  });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    path: req.path,
    method: req.method
  });
});

// Catch-all for undefined routes - Return 404 instead of 403
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
    availableRoutes: [
      "GET /",
      "GET /health",
      "POST /api/auth/register",
      "POST /api/auth/login"
    ]
  });
});

const PORT = process.env.PORT || 3001; // Changed from 5000 to avoid AirPlay conflict
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Accessible from: http://localhost:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log(`🌐 Also accessible from your network IP`);
  }
});
