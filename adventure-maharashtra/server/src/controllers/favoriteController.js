import Favorite from '../models/Favorite.js';
import Park from '../models/Park.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all favorite parks for authenticated user
// @route   GET /api/favorites
// @access  Private
export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate({
      path: 'park',
      populate: { path: 'packages' }
    })
    .sort({ createdAt: -1 });

  const parks = favorites.map(f => f.park).filter(Boolean);

  res.status(200).json({
    success: true,
    count: parks.length,
    data: parks
  });
});

// @desc    Add park to favorites
// @route   POST /api/favorites
// @access  Private
export const addFavorite = asyncHandler(async (req, res) => {
  const { parkId } = req.body;

  if (!parkId) {
    return res.status(400).json({ success: false, message: 'Please provide parkId to favorite.' });
  }

  const park = await Park.findById(parkId);
  if (!park) {
    return res.status(404).json({ success: false, message: 'Destination not found.' });
  }

  // Idempotent upsert
  const favorite = await Favorite.findOneAndUpdate(
    { user: req.user._id, park: parkId },
    { user: req.user._id, park: parkId },
    { upsert: true, returnDocument: 'after' }
  );

  res.status(200).json({
    success: true,
    message: `${park.name} added to your saved favorites.`,
    data: favorite
  });
});

// @desc    Remove park from favorites
// @route   DELETE /api/favorites/:parkId
// @access  Private
export const removeFavorite = asyncHandler(async (req, res) => {
  const { parkId } = req.params;

  await Favorite.findOneAndDelete({
    user: req.user._id,
    park: parkId
  });

  res.status(200).json({
    success: true,
    message: 'Removed from saved favorites.'
  });
});

// @desc    Check if park is favorited
// @route   GET /api/favorites/check/:parkId
// @access  Private
export const checkIsFavorite = asyncHandler(async (req, res) => {
  const { parkId } = req.params;

  const favorite = await Favorite.findOne({
    user: req.user._id,
    park: parkId
  });

  res.status(200).json({
    success: true,
    isFavorite: !!favorite
  });
});