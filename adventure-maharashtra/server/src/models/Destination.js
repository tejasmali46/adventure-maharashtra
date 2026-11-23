import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Destination slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  tagline: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  bestTimeToVisit: {
    type: String,
    default: 'October to March'
  },
  popularActivities: [{
    type: String
  }],
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  parkSlugs: [{
    type: String
  }]
}, {
  timestamps: true
});

export const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;