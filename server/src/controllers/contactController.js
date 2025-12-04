import Contact from "../models/Contact.js";

/**
 * Helper to get the logged-in user's id from req.user (works with either ._id or .id)
 */
function getUserId(req) {
  return (req.user && (req.user._id || req.user.id)) || null;
}

/**
 * Geocode address to get latitude and longitude using FREE Nominatim (OpenStreetMap)
 * No API key required - 100% free
 */
async function geocodeAddress(address) {
  if (!address) return { lat: null, lng: null };
  
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MissionConnect' }
    });
    const data = await response.json();
    
    if (data && data.length > 0) {
      const location = data[0];
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lon);
      console.log(`✅ Geocoded "${address}" → lat: ${lat}, lng: ${lng}`);
      return { lat, lng };
    }
    
    console.warn(`⚠️  No geocoding results for: ${address}`);
    return { lat: null, lng: null };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { lat: null, lng: null };
  }
}

/**
 * POST /api/contacts/geocode-all
 * Geocode all contacts in the database that have addresses but no coordinates
 * This is a one-time migration for existing contacts
 */
export const geocodeAllContacts = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Find all contacts belonging to this user without lat/lng but with address
    const contactsToGeocode = await Contact.find({
      $or: [{ owner: userId }, { missionary: userId }],
      address: { $exists: true, $ne: '' },
      $or: [
        { lat: null },
        { lat: { $exists: false } },
        { lng: null },
        { lng: { $exists: false } }
      ]
    });

    console.log(`🗺️  Found ${contactsToGeocode.length} contacts to geocode`);

    let geocodedCount = 0;
    for (const contact of contactsToGeocode) {
      const { lat, lng } = await geocodeAddress(contact.address);
      if (lat && lng) {
        contact.lat = lat;
        contact.lng = lng;
        await contact.save();
        geocodedCount++;
      }
    }

    return res.status(200).json({
      message: `Geocoded ${geocodedCount} contacts`,
      geocodedCount,
      totalCount: contactsToGeocode.length
    });
  } catch (error) {
    console.error("Error geocoding contacts:", error);
    return res.status(500).json({ message: "Server error geocoding contacts" });
  }
};

/**
 * GET /api/contacts
 * Return all contacts that belong to the logged-in user.
 * Accepts an optional query ?q for searching by firstName/lastName.
 */
export const getContacts = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { q } = req.query;
    const baseFilter = {
      $or: [
        { owner: userId },
        { missionary: userId } 
      ]
    };

    // if a search query is provided, add name filters
    if (q) {
      baseFilter.$and = [
        {
          $or: [
            { firstName: { $regex: q, $options: "i" } },
            { lastName: { $regex: q, $options: "i" } },
            { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: q, options: "i" } } }
          ]
        }
      ];
    }

    const contacts = await Contact.find(baseFilter).sort({ firstName: 1 }).lean();
    return res.json(contacts);
  } catch (error) {
    console.error("Error getting contacts:", error);
    return res.status(500).json({ message: "Server error fetching contacts" });
  }
};

/**
 * POST /api/contacts
 * Create a new contact and attach the logged-in user as owner/missionary.
 */
export const createContact = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Accept fields sent by the frontend; don't overwrite user-provided owner if present
    const payload = { ...req.body };

    // Ensure owner/missionary is set so other parts of the app can find it
    payload.owner = payload.owner || userId;
    payload.missionary = payload.missionary || userId;

    // Geocode address to get lat/lng if not already provided
    if (payload.address && (!payload.lat || !payload.lng)) {
      console.log(`🗺️  Geocoding address: ${payload.address}`);
      const { lat, lng } = await geocodeAddress(payload.address);
      if (lat && lng) {
        payload.lat = lat;
        payload.lng = lng;
      }
    }

    const contact = new Contact(payload);
    await contact.save();

    return res.status(201).json(contact);
  } catch (error) {
    console.error("Error creating contact:", error);
    // Handle duplicate key errors gracefully if unique indexes exist
    if (error.code === 11000) {
      return res.status(400).json({ message: "Contact already exists (duplicate)" });
    }
    return res.status(500).json({ message: "Server error creating contact" });
  }
};

/**
 * GET /api/contacts/:id
 * Return a single contact if it belongs to the logged-in user.
 */
export const getContactById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const contactId = req.params.id;
    if (!contactId) return res.status(400).json({ message: "Contact id required" });

    const contact = await Contact.findOne({
      _id: contactId,
      $or: [{ owner: userId }, { missionary: userId }],
    }).lean();

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    return res.status(200).json(contact);
  } catch (error) {
    console.error("Error fetching contact by ID:", error);
    return res.status(500).json({ message: "Server error fetching contact" });
  }
};

/**
 * PUT /api/contacts/:id
 * Update a contact if it belongs to the logged-in user.
 */
export const updateContact = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const contactId = req.params.id;
    if (!contactId) return res.status(400).json({ message: "Contact id required" });

    const contact = await Contact.findOne({
      _id: contactId,
      $or: [{ owner: userId }, { missionary: userId }],
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Update allowed fields
    const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'lat', 'lng', 'age', 'gender', 'language', 'tags', 'baptismDate', 'progress', 'nextAppointment', 'notesSummary'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        contact[field] = req.body[field];
      }
    });

    // If address was updated and lat/lng not provided, geocode it
    if (req.body.address && contact.address && (!req.body.lat || !req.body.lng)) {
      console.log(`🗺️  Geocoding updated address: ${contact.address}`);
      const { lat, lng } = await geocodeAddress(contact.address);
      if (lat && lng) {
        contact.lat = lat;
        contact.lng = lng;
      }
    }

    await contact.save();
    return res.status(200).json(contact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({ message: "Server error updating contact" });
  }
};

/**
 * DELETE /api/contacts/:id
 * Delete a contact if it belongs to the logged-in user.
 */
export const deleteContact = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const contactId = req.params.id;
    if (!contactId) return res.status(400).json({ message: "Contact id required" });

    const contact = await Contact.findOne({
      _id: contactId,
      $or: [{ owner: userId }, { missionary: userId }],
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await Contact.deleteOne({ _id: contactId });
    return res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return res.status(500).json({ message: "Server error deleting contact" });
  }
};
