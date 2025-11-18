import express from "express";
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationsByContact,
  getLocationsForMapView
} from "../controllers/locationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * Public endpoints (require authentication)
 */

// Get all locations for logged-in user
// Query params: ?contactId=..., ?isPrimary=true/false, ?bounds=lat1,lng1,lat2,lng2
router.get("/", protect, getLocations);

// Create a new location
router.post("/", protect, createLocation);

// Get locations for map display (bulk endpoint)
router.post("/bulk/map-view", protect, getLocationsForMapView);

// Get a single location by ID
router.get("/:id", protect, getLocationById);

// Update a location
router.put("/:id", protect, updateLocation);

// Delete a location (soft delete)
router.delete("/:id", protect, deleteLocation);

// Get all locations for a specific contact
router.get("/contact/:contactId", protect, getLocationsByContact);

export default router;
