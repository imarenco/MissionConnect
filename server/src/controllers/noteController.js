import Note from '../models/Note.js';
import Contact from '../models/Contact.js';

/**
 * Helper to get the logged-in user's id from req.user
 */
function getUserId(req) {
  return (req.user && (req.user._id || req.user.id)) || null;
}

/**
 * GET /api/notes
 * Get all notes for a contact (query param: ?contactId=...)
 */
export const getNotes = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { contactId } = req.query;
    if (!contactId) {
      return res.status(400).json({ message: "contactId query parameter is required" });
    }

    // Verify contact belongs to user
    const contact = await Contact.findOne({
      _id: contactId,
      $or: [{ owner: userId }, { missionary: userId }],
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const notes = await Note.find({ contact: contactId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(notes);
  } catch (error) {
    console.error("Error getting notes:", error);
    return res.status(500).json({ message: "Server error fetching notes" });
  }
};

/**
 * POST /api/notes
 * Create a new note for a contact
 */
export const createNote = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { contact, text } = req.body;

    if (!contact || !text) {
      return res.status(400).json({ message: "Contact and text are required" });
    }

    // Verify contact belongs to user
    const contactExists = await Contact.findOne({
      _id: contact,
      $or: [{ owner: userId }, { missionary: userId }],
    });

    if (!contactExists) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const note = new Note({
      contact,
      author: userId,
      text,
    });

    await note.save();
    await note.populate('author', 'name email');

    return res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    return res.status(500).json({ message: "Server error creating note" });
  }
};

/**
 * DELETE /api/notes/:id
 * Delete a note
 */
export const deleteNote = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const noteId = req.params.id;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Verify the note's contact belongs to user
    const contact = await Contact.findOne({
      _id: note.contact,
      $or: [{ owner: userId }, { missionary: userId }],
    });

    if (!contact) {
      return res.status(403).json({ message: "Not authorized to delete this note" });
    }

    await Note.deleteOne({ _id: noteId });
    return res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({ message: "Server error deleting note" });
  }
};

