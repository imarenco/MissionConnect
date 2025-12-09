import Visit from '../models/Visit.js';
import Contact from '../models/Contact.js'; 

export const createVisit = async (req, res) => {
  try {
    
    const { contact, datetime, notes } = req.body;

    if (!contact || !datetime) {
      return res.status(400).json({ message: "Contact and datetime are required." });
    }

    // Parse datetime
    const dt = new Date(datetime);
    if (isNaN(dt.getTime())) {
      return res.status(400).json({ message: "Invalid datetime format. Provide ISO datetime." });
    }

    // Optionally verify contact exists (helps debugging)
    // If your Contact model path is different, adjust import above.
    const contactExists = await Contact.findById(contact).select('_id firstName lastName').lean();
    if (!contactExists) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // user can be either req.user._id or req.user.id depending on middleware
    const userId = req.user?._id || req.user?.id || req.user;

    const visit = new Visit({
      contact,
      user: userId,
      datetime: dt,
      notes: notes || '',
      reminderScheduled: false
    });

    const savedVisit = await visit.save();
    // Optionally populate contact brief info
    await savedVisit.populate('contact', 'firstName lastName phone');

    return res.status(201).json(savedVisit);
  } catch (error) {
    console.error('Error creating visit:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getVisits = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;
    const { contactId } = req.query;

    // Build filter
    const filter = { user: userId };
    if (contactId) {
      filter.contact = contactId;
    }

    const visits = await Visit.find(filter)
      .populate('contact', 'firstName lastName phone')
      .sort({ datetime: 1 })
      .lean();

    return res.status(200).json(visits);
  } catch (error) {
    console.error('Error getting visits:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getVisitById = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;
    const visitId = req.params.id;

    const visit = await Visit.findOne({ _id: visitId, user: userId })
      .populate('contact', 'firstName lastName phone')
      .lean();

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    return res.status(200).json(visit);
  } catch (error) {
    console.error('Error getting visit:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const updateVisit = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;
    const visitId = req.params.id;
    const { datetime, notes, status } = req.body;

    // Find the visit and ensure it belongs to the user
    const visit = await Visit.findOne({ _id: visitId, user: userId });
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    // Update fields
    if (datetime) {
      const dt = new Date(datetime);
      if (isNaN(dt.getTime())) {
        return res.status(400).json({ message: "Invalid datetime format. Provide ISO datetime." });
      }
      visit.datetime = dt;
    }

    if (notes !== undefined) {
      visit.notes = notes;
    }

    if (status !== undefined) {
      // Validate status value
      const validStatuses = ['scheduled', 'successful', 'unable_to_contact', 'rescheduled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be one of: scheduled, successful, unable_to_contact, rescheduled" });
      }
      visit.status = status;
    }

    const updatedVisit = await visit.save();
    await updatedVisit.populate('contact', 'firstName lastName phone');

    return res.status(200).json(updatedVisit);
  } catch (error) {
    console.error('Error updating visit:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteVisit = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;
    const visitId = req.params.id;

    const visit = await Visit.findOne({ _id: visitId, user: userId });
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    await Visit.deleteOne({ _id: visitId });
    return res.status(200).json({ message: 'Visit deleted successfully' });
  } catch (error) {
    console.error('Error deleting visit:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};
