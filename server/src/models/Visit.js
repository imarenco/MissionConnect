import mongoose from 'mongoose';

const VisitSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who scheduled
  datetime: { type: Date, required: true },
  notes: { type: String, default: false},
  reminderScheduled: { type: Boolean, default: false },
  status: { type: String, enum: ['scheduled', 'successful', 'unable_to_contact', 'rescheduled'], default: 'scheduled' }
}, { timestamps: true });

export default mongoose.model('Visit', VisitSchema);
