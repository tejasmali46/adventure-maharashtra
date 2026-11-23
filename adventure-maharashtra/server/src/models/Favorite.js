import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  park: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Park',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Prevent duplicate favorites for the same user and park
favoriteSchema.index({ user: 1, park: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;