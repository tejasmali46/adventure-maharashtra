import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  tagline: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT_AMOUNT'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minBookingAmountPaise: {
    type: Number,
    default: 0
  },
  minPassCount: {
    type: Number,
    default: 1
  },
  maxDiscountPaise: {
    type: Number,
    default: null
  },
  validUntil: {
    type: Date,
    required: true
  },
  applicableDays: [{
    type: String
  }],
  badge: {
    type: String,
    default: 'Special Offer'
  },
  terms: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

export const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;