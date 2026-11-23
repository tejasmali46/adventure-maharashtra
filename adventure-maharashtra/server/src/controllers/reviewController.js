import Review from '../models/Review.js';
import Park from '../models/Park.js';
import Booking from '../models/Booking.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper to recalculate park aggregate rating
const updateParkAggregateRating = async (parkId) => {
  const reviews = await Review.find({ park: parkId, moderationStatus: 'APPROVED' });
  const count = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;

  await Park.findByIdAndUpdate(parkId, {
    rating: average,
    reviewCount: count
  });

  return { average, count };
};

// @desc    Get all reviews for a park with rating breakdown
// @route   GET /api/reviews/park/:parkId
// @access  Public
export const getParkReviews = asyncHandler(async (req, res) => {
  const { parkId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { sort = 'latest' } = req.query;

  let sortOption = { createdAt: -1 };
  if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
  if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };

  const query = { park: parkId, moderationStatus: 'APPROVED' };

  const [reviews, totalCount, allParkReviews] = await Promise.all([
    Review.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatar role'),
    Review.countDocuments(query),
    Review.find(query).select('rating')
  ]);

  // Compute rating breakdown percentages
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allParkReviews.forEach((r) => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating] += 1;
    }
  });

  const total = allParkReviews.length;
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: distribution[stars],
    percentage: total > 0 ? Math.round((distribution[stars] / total) * 100) : 0
  }));

  const avgRating = total > 0
    ? Number((allParkReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
    : 0;

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        averageRating: avgRating,
        totalReviews: total,
        breakdown
      }
    }
  });
});

// @desc    Create or update a customer review with verified visitor check
// @route   POST /api/reviews
// @access  Private (Authenticated users)
export const createReview = asyncHandler(async (req, res) => {
  const { parkId, rating, comment } = req.body;

  if (!parkId || !rating || !comment) {
    return res.status(400).json({
      success: false,
      message: 'Please provide parkId, rating (1-5), and a comment.'
    });
  }

  const numRating = Number(rating);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5 stars.'
    });
  }

  const park = await Park.findById(parkId);
  if (!park) {
    return res.status(404).json({ success: false, message: 'Park not found.' });
  }

  // Check if visitor has a verified booking
  const verifiedBooking = await Booking.findOne({
    user: req.user._id,
    park: parkId,
    bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] }
  });

  const isVerifiedBooking = Boolean(verifiedBooking);

  // Check if review already exists for this user and park
  let review = await Review.findOne({ park: parkId, user: req.user._id });

  if (review) {
    review.rating = numRating;
    review.comment = comment.trim();
    review.isVerifiedBooking = isVerifiedBooking;
    review.booking = verifiedBooking ? verifiedBooking._id : review.booking;
    review.moderationStatus = 'APPROVED';
    await review.save();
  } else {
    review = await Review.create({
      park: parkId,
      user: req.user._id,
      rating: numRating,
      comment: comment.trim(),
      isVerifiedBooking,
      booking: verifiedBooking ? verifiedBooking._id : null,
      moderationStatus: 'APPROVED'
    });
  }

  // Recalculate park rating
  const updatedRating = await updateParkAggregateRating(parkId);

  res.status(201).json({
    success: true,
    message: isVerifiedBooking 
      ? 'Review submitted with Verified Visitor badge!' 
      : 'Review submitted successfully!',
    data: {
      review,
      parkRating: updatedRating
    }
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner, Super Admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found.' });
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

  if (!isOwner && !isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
  }

  const parkId = review.park;
  await Review.findByIdAndDelete(req.params.id);
  const updatedRating = await updateParkAggregateRating(parkId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully.',
    data: { parkRating: updatedRating }
  });
});