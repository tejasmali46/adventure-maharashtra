import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['RAZORPAY', 'MOCK_SANDBOX'],
    default: 'MOCK_SANDBOX'
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  paymentId: {
    type: String,
    index: true
  },
  signature: {
    type: String
  },
  amountPaise: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  method: {
    type: String,
    default: 'UPI'
  },
  idempotencyKey: {
    type: String,
    sparse: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    default: 'PENDING',
    index: true
  },
  rawResponse: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

export const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;