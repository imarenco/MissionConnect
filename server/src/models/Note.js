import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Note', NoteSchema);
