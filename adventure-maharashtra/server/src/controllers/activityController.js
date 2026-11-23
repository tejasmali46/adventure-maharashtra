import Activity from '../models/Activity.js';
import Park from '../models/Park.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all active activities
// @route   GET /api/activities
// @access  Public
export const getActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ status: 'ACTIVE' }).sort({ name: 1 });

  // Add real counts of parks offering each activity
  const activitiesWithParks = await Promise.all(
    activities.map(async (act) => {
      const parkCount = await Park.countDocuments({
        isActive: true,
        activityNames: { $in: [act.name] }
      });
      return {
        ...act.toObject(),
        parkCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: activitiesWithParks.length,
    data: activitiesWithParks
  });
});

// @desc    Get activity by slug and its associated parks
// @route   GET /api/activities/:slug
// @access  Public
export const getActivityBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const activity = await Activity.findOne({ slug: slug.toLowerCase(), status: 'ACTIVE' });
  if (!activity) {
    return res.status(404).json({ success: false, message: 'Activity not found' });
  }

  const parks = await Park.find({
    isActive: true,
    activityNames: { $in: [activity.name] }
  }).populate('packages');

  res.status(200).json({
    success: true,
    data: {
      activity,
      parks
    }
  });
});