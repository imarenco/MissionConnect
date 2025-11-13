import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: String,
  lastName: String,
  phone: String,
  address: String,
  lat: Number,
  lng: Number,
  age: Number,
  gender: { type: String, enum: ['male','female','other', 'unknown'], default: 'unknown' },
  language: String,
  tags: [String],
  baptismDate: Date,
  progress: { type: Number, min: 0, max: 5, default: 0 }, // lessons taught 0-5
  nextAppointment: Date,
  notesSummary: String
}, { timestamps: true });

ContactSchema.index({ owner: 1, phone: 1 }, { unique: true, partialFilterExpression: { phone: { $exists: true } } });

export default mongoose.model('Contact', ContactSchema);
