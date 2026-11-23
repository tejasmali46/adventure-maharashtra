import Destination from '../models/Destination.js';
import Park from '../models/Park.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all destinations with live park counts
// @route   GET /api/destinations
// @access  Public
export const getDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.find().sort({ name: 1 });

  const destinationsWithCounts = await Promise.all(
    destinations.map(async (dest) => {
      // Find parks matching destination city or parkSlugs
      const parkCount = await Park.countDocuments({
        isActive: true,
        $or: [
          { slug: { $in: dest.parkSlugs } },
          { city: { $regex: new RegExp(dest.name.split(' ')[0], 'i') } }
        ]
      });
      return {
        ...dest.toObject(),
        parkCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: destinationsWithCounts.length,
    data: destinationsWithCounts
  });
});

// @desc    Get single destination by slug with associated parks
// @route   GET /api/destinations/:slug
// @access  Public
export const getDestinationBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const destination = await Destination.findOne({ slug: slug.toLowerCase() });
  if (!destination) {
    return res.status(404).json({ success: false, message: 'Destination not found' });
  }

  const parks = await Park.find({
    isActive: true,
    $or: [
      { slug: { $in: destination.parkSlugs } },
      { city: { $regex: new RegExp(destination.name.split(' ')[0], 'i') } }
    ]
  }).populate('packages');

  res.status(200).json({
    success: true,
    data: {
      destination,
      parks
    }
  });
});