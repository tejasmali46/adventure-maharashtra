import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketReference: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
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
  qrToken: {
    type: String,
    required: true,
    unique: true
  },
  totalAdmissions: {
    type: Number,
    required: true
  },
  admissionsRedeemed: {
    type: Number,
    default: 0
  },
  isFullyRedeemed: {
    type: Boolean,
    default: false,
    index: true
  },
  redemptionHistory: [{
    redeemedAt: { type: Date, default: Date.now },
    redeemedCount: Number,
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gateNumber: String
  }]
}, {
  timestamps: true
});

export const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;