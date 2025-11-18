import Location from "../models/Location.js";
import Contact from "../models/Contact.js";

/**
 * Helper to get the logged-in user's id from req.user
 */
function getUserId(req) {
  return (req.user && (req.user._id || req.user.id)) || null;
}

/**
 * GET /api/locations
 * Get all locations for the logged-in user's contacts
 * Optional query params:
 * - contactId: filter by specific contact
 * - isPrimary: true/false to filter by primary location
 * - bounds: lat1,lng1,lat2,lng2 for bounding box query
 */
export const getLocations = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { contactId, isPrimary, bounds } = req.query;
    
    // Base filter: only get locations owned by this user
    const filter = { owner: userId, isActive: true };

    // Filter by specific contact if provided
    if (contactId) {
      filter.contact = contactId;
    }

    // Filter by primary location if specified
    if (isPrimary !== undefined) {
      filter.isPrimary = isPrimary === 'true';
    }

    // Bounding box query for map viewport filtering
    // Format: ?bounds=lat1,lng1,lat2,lng2
    if (bounds) {
      try {
        const [lat1, lng1, lat2, lng2] = bounds.split(',').map(Number);
        filter.latitude = { $gte: Math.min(lat1, lat2), $lte: Math.max(lat1, lat2) };
        filter.longitude = { $gte: Math.min(lng1, lng2), $lte: Math.max(lng1, lng2) };
      } catch (e) {
        return res.status(400).json({ message: "Invalid bounds format. Use: lat1,lng1,lat2,lng2" });
      }
    }

    const locations = await Location.find(filter)
      .populate('contact', 'firstName lastName phone')
      .sort({ isPrimary: -1, createdAt: -1 })
      .lean();

    return res.json(locations);
  } catch (error) {
    console.error("Error getting locations:", error);
    return res.status(500).json({ message: "Server error fetching locations" });
  }
};

/**
 * GET /api/locations/:id
 * Get a single location by ID
 */
export const getLocationById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Location id required" });

    const location = await Location.findOne({
      _id: id,
      owner: userId
    }).populate('contact', 'firstName lastName phone').lean();

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    return res.json(location);
  } catch (error) {
    console.error("Error getting location by ID:", error);
    return res.status(500).json({ message: "Server error fetching location" });
  }
};

/**
 * POST /api/locations
 * Create a new location and attach it to a contact
 * Required body fields:
 * - contactId: ID of the contact to attach this location to
 * - latitude: latitude coordinate
 * - longitude: longitude coordinate
 * Optional fields:
 * - streetName, streetNumber, city, state, country, postalCode
 * - locationName, locationDescription
 * - accuracy, placeId
 */
export const createLocation = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { contactId, latitude, longitude, ...otherFields } = req.body;

    // Validate required fields
    if (!contactId) return res.status(400).json({ message: "contactId is required" });
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "latitude and longitude are required" });
    }

    // Validate coordinates are valid numbers
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ message: "latitude and longitude must be numbers" });
    }

    // Verify contact exists and belongs to user
    const contact = await Contact.findOne({ _id: contactId, owner: userId });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found or does not belong to user" });
    }

    // If this is marked as primary, unset other primary locations for this contact
    if (otherFields.isPrimary === true) {
      await Location.updateMany(
        { contact: contactId, owner: userId, isPrimary: true },
        { isPrimary: false }
      );
    }

    const location = new Location({
      contact: contactId,
      owner: userId,
      latitude,
      longitude,
      ...otherFields
    });

    await location.save();
    await location.populate('contact', 'firstName lastName phone');

    return res.status(201).json(location);
  } catch (error) {
    console.error("Error creating location:", error);
    return res.status(500).json({ message: "Server error creating location" });
  }
};

/**
 * PUT /api/locations/:id
 * Update an existing location
 */
export const updateLocation = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Location id required" });

    const location = await Location.findOne({ _id: id, owner: userId });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // If setting as primary, unset other primary locations for this contact
    if (req.body.isPrimary === true && !location.isPrimary) {
      await Location.updateMany(
        { contact: location.contact, owner: userId, isPrimary: true },
        { isPrimary: false }
      );
    }

    // Update allowed fields
    const allowedFields = [
      'streetName', 'streetNumber', 'city', 'state', 'country', 'postalCode',
      'locationName', 'locationDescription', 'latitude', 'longitude',
      'accuracy', 'placeId', 'isPrimary', 'isActive'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        location[field] = req.body[field];
      }
    });

    await location.save();
    await location.populate('contact', 'firstName lastName phone');

    return res.json(location);
  } catch (error) {
    console.error("Error updating location:", error);
    return res.status(500).json({ message: "Server error updating location" });
  }
};

/**
 * DELETE /api/locations/:id
 * Soft delete a location (set isActive to false)
 */
export const deleteLocation = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Location id required" });

    const location = await Location.findOne({ _id: id, owner: userId });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    location.isActive = false;
    await location.save();

    return res.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    return res.status(500).json({ message: "Server error deleting location" });
  }
};

/**
 * GET /api/locations/contact/:contactId
 * Get all locations for a specific contact
 */
export const getLocationsByContact = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { contactId } = req.params;
    if (!contactId) return res.status(400).json({ message: "Contact id required" });

    // Verify contact belongs to user
    const contact = await Contact.findOne({ _id: contactId, owner: userId });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found or does not belong to user" });
    }

    const locations = await Location.find({
      contact: contactId,
      owner: userId,
      isActive: true
    }).sort({ isPrimary: -1, createdAt: -1 }).lean();

    return res.json(locations);
  } catch (error) {
    console.error("Error getting locations by contact:", error);
    return res.status(500).json({ message: "Server error fetching locations" });
  }
};

/**
 * POST /api/locations/bulk/map-view
 * Get locations for multiple contacts at once (for map display)
 * Body: { contactIds: [...] }
 */
export const getLocationsForMapView = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { contactIds } = req.body;
    if (!Array.isArray(contactIds)) {
      return res.status(400).json({ message: "contactIds must be an array" });
    }

    const locations = await Location.find({
      contact: { $in: contactIds },
      owner: userId,
      isActive: true,
      isPrimary: true // Only get primary locations for map
    }).populate('contact', 'firstName lastName phone').lean();

    return res.json(locations);
  } catch (error) {
    console.error("Error getting map view locations:", error);
    return res.status(500).json({ message: "Server error fetching map locations" });
  }
};
