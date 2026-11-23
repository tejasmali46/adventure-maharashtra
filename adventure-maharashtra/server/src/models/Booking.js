import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  park: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Park',
    required: true,
    index: true
  },
  visitDate: {
    type: Date,
    required: true,
    index: true
  },
  packageSnapshot: {
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    name: { type: String, required: true },
    pricePaise: { type: Number, required: true },
    includesExpress: { type: Boolean, default: false }
  },
  visitorQuantities: {
    adults: { type: Number, default: 1, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    seniors: { type: Number, default: 0, min: 0 }
  },
  addons: [{
    name: { type: String, required: true },
    pricePaise: { type: Number, required: true },
    quantity: { type: Number, default: 1, min: 1 }
  }],
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  priceBreakdown: {
    basePassesPaise: { type: Number, default: 0 },
    weekendSurgePaise: { type: Number, default: 0 },
    subtotalPaise: { type: Number, required: true },
    addonsPaise: { type: Number, default: 0 },
    discountPaise: { type: Number, default: 0 },
    taxPaise: { type: Number, default: 0 }, // 18% GST
    totalAmountPaise: { type: Number, required: true }
  },
  couponApplied: {
    code: String,
    discountValue: Number,
    discountType: String
  },
  bookingStatus: {
    type: String,
    enum: ['PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'COMPLETED', 'EXPIRED'],
    default: 'CONFIRMED',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    default: 'SUCCESS',
    index: true
  },
  paymentReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  ticketReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  },
  cancellationDetails: {
    cancelledAt: Date,
    reason: String,
    refundEligiblePaise: { type: Number, default: 0 },
    refundPercentage: { type: Number, default: 0 },
    refundStatus: { type: String, enum: ['NONE', 'PENDING', 'PROCESSED'], default: 'NONE' }
  }
}, {
  timestamps: true
});

export const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;