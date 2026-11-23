import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  park: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Park',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  isVerifiedBooking: {
    type: Boolean,
    default: false
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  moderationStatus: {
    type: String,
    enum: ['APPROVED', 'PENDING', 'FLAGGED', 'REJECTED'],
    default: 'APPROVED',
    index: true
  }
}, {
  timestamps: true
});

export const Review = mongoose.model('Review', reviewSchema);
export default Review;