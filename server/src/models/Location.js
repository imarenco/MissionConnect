import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Geographic coordinates for map display
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  
  // Address details
  streetName: String,
  streetNumber: String,
  city: String,
  state: String,
  country: String,
  postalCode: String,
  
  // Additional location info
  locationName: String, // e.g., "Home", "Work", "Church"
  locationDescription: String,
  
  // Accuracy and validation
  accuracy: { type: Number, default: null }, // GPS accuracy in meters
  placeId: String, // Google Places ID or similar service ID
  
  // Metadata
  isPrimary: { type: Boolean, default: true }, // Default location for this contact
  isActive: { type: Boolean, default: true },
  
}, { timestamps: true });

// Compound index for efficient querying
LocationSchema.index({ contact: 1, isPrimary: 1 });
LocationSchema.index({ owner: 1, isActive: 1 });
LocationSchema.index({ latitude: 1, longitude: 1 }); // For geographic queries

// Index for geospatial queries (2dsphere for earth)
LocationSchema.index({ 'coordinates': '2dsphere' });

export default mongoose.model('Location', LocationSchema);
