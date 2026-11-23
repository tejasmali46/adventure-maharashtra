import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Activity name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Activity slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  intensity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Extreme'],
    default: 'Medium'
  },
  iconName: {
    type: String,
    default: 'Zap'
  },
  image: {
    type: String,
    required: true
  },
  restrictions: {
    minAge: { type: Number, default: 0 },
    maxWeightKg: { type: Number, default: 120 },
    minHeightCm: { type: Number, default: 0 }
  },
  safetyRequirements: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

export const Activity = mongoose.model('Activity', activitySchema);
export default Activity;