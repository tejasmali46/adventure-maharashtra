import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  park: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Park',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  pricePaise: {
    type: Number,
    required: [true, 'Base price in paise is required'],
    min: [0, 'Price cannot be negative']
  },
  includesExpress: {
    type: Boolean,
    default: false
  },
  visitorCategories: [{
    type: { type: String, required: true },
    pricePaise: { type: Number, required: true }
  }],
  features: [{
    type: String
  }],
  includedActivities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  availabilityRules: {
    maxDailyPasses: { type: Number, default: 500 }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

export const Package = mongoose.model('Package', packageSchema);
export default Package;