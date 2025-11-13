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
    const visits = await Visit.find({ user: userId })
      .populate('contact', 'firstName lastName phone')
      .sort({ datetime: 1 })
      .lean();

    return res.status(200).json(visits);
  } catch (error) {
    console.error('Error getting visits:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};
