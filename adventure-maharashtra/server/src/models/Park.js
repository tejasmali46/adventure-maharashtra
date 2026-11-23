import mongoose from 'mongoose';

const parkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Park name is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  tagline: {
    type: String,
    trim: true,
    maxlength: 300
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    index: true
  },
  district: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    default: 'Maharashtra'
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true
  },
  listingType: {
    type: String,
    enum: ['DIRECT_MANAGED', 'AUTHORIZED_THIRD_PARTY'],
    default: 'AUTHORIZED_THIRD_PARTY',
    index: true
  },
  isDirectManaged: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  heroImage: {
    type: String,
    required: [true, 'Hero image URL is required']
  },
  gallery: [{
    type: String
  }],
  startingPricePaise: {
    type: Number,
    required: [true, 'Starting price in paise is required'],
    min: 0,
    index: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  operatingHours: {
    open: { type: String, default: '10:00 AM' },
    close: { type: String, default: '07:00 PM' },
    days: { type: String, default: 'Monday to Sunday' },
    ridesClosing: { type: String, default: '06:30 PM' }
  },
  facilities: [{
    type: String
  }],
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  activityNames: [{
    type: String,
    index: true
  }],
  packages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }],
  safetyGuidelines: [{
    type: String
  }],
  cancellationPolicy: {
    type: String,
    default: 'Free cancellation up to 48 hours prior to booking date.'
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  approvalStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for search and geospatial queries
parkSchema.index({ location: '2dsphere' });
parkSchema.index({ name: 'text', description: 'text', city: 'text', activityNames: 'text' });
parkSchema.index({ city: 1, category: 1, startingPricePaise: 1, rating: -1 });

export const Park = mongoose.model('Park', parkSchema);
export default Park;