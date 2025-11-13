import Contact from "../models/Contact.js";

/**
 * Helper to get the logged-in user's id from req.user (works with either ._id or .id)
 */
function getUserId(req) {
  return (req.user && (req.user._id || req.user.id)) || null;
}

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
