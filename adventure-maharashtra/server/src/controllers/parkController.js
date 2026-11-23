import Park from '../models/Park.js';
import Package from '../models/Package.js';
import asyncHandler from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';

// @desc    Get all parks with filtering, searching, sorting, and pagination
// @route   GET /api/parks
// @access  Public
export const getParks = asyncHandler(async (req, res) => {
  const {
    search,
    city,
    category,
    minPrice,
    maxPrice,
    minRating,
    activity,
    isDirectOnly,
    sort = 'popularity',
    page = 1,
    limit = 12
  } = req.query;

  // Build safe MongoDB query using allowlist
  const query = { isActive: true, approvalStatus: 'APPROVED' };

  // City filter
  if (city && city !== 'All' && city !== 'All Cities') {
    query.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
  }

  // Category filter
  if (category && category !== 'All' && category !== 'All Categories') {
    query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
  }

  // Activity filter
  if (activity && activity !== 'All') {
    query.activityNames = { $in: [activity.trim()] };
  }

  // Direct Managed Partner Only
  if (isDirectOnly === 'true' || isDirectOnly === true) {
    query.isDirectManaged = true;
  }

  // Price range (frontend sends in Rupees, compare in Paise)
  if (minPrice || maxPrice) {
    query.startingPricePaise = {};
    if (minPrice) query.startingPricePaise.$gte = Number(minPrice) * 100;
    if (maxPrice) query.startingPricePaise.$lte = Number(maxPrice) * 100;
  }

  // Minimum Rating
  if (minRating && Number(minRating) > 0) {
    query.rating = { $gte: Number(minRating) };
  }

  // Search keyword (name, description, city, activity)
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escaped, 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { city: searchRegex },
      { activityNames: searchRegex }
    ];
  }

  // Sorting
  let sortOption = {};
  if (sort === 'price-asc') {
    sortOption = { startingPricePaise: 1 };
  } else if (sort === 'price-desc') {
    sortOption = { startingPricePaise: -1 };
  } else if (sort === 'rating') {
    sortOption = { rating: -1, reviewCount: -1 };
  } else {
    // Default: popularity
    sortOption = { reviewCount: -1, rating: -1 };
  }

  // Pagination
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNumber - 1) * pageSize;

  const total = await Park.countDocuments(query);
  const parks = await Park.find(query)
    .populate('packages')
    .sort(sortOption)
    .skip(skip)
    .limit(pageSize);

  res.status(200).json({
    success: true,
    count: parks.length,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize),
    data: parks
  });
});

// @desc    Get single park by slug
// @route   GET /api/parks/:slug
// @access  Public
export const getParkBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const park = await Park.findOne({ slug: slug.toLowerCase(), isActive: true })
    .populate('packages')
    .populate('activities');

  if (!park) {
    return res.status(404).json({
      success: false,
      message: `Destination with slug '${slug}' not found`
    });
  }

  res.status(200).json({
    success: true,
    data: park
  });
});

// @desc    Get featured parks
// @route   GET /api/parks/featured
// @access  Public
export const getFeaturedParks = asyncHandler(async (req, res) => {
  const featuredParks = await Park.find({ isFeatured: true, isActive: true })
    .populate('packages')
    .limit(6);

  res.status(200).json({
    success: true,
    count: featuredParks.length,
    data: featuredParks
  });
});

// @desc    Check park availability on specific date
// @route   GET /api/parks/:slug/availability
// @access  Public
export const checkParkAvailability = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { date } = req.query;

  const park = await Park.findOne({ slug: slug.toLowerCase() });
  if (!park) {
    return res.status(404).json({ success: false, message: 'Park not found' });
  }

  const visitDate = date ? new Date(date) : new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[visitDate.getDay()];

  // Check if park operating days string excludes this day
  const isOpenDay = !park.operatingHours.days.toLowerCase().includes(`closed ${dayOfWeek.toLowerCase()}`);

  res.status(200).json({
    success: true,
    parkSlug: park.slug,
    parkName: park.name,
    date: visitDate.toISOString().split('T')[0],
    dayOfWeek,
    isAvailable: isOpenDay && park.isActive,
    operatingHours: park.operatingHours,
    isDirectManaged: park.isDirectManaged
  });
});

// ============================================================================
// PARTNER / ADMIN PARK MANAGEMENT CONTROLLERS
// ============================================================================

// @desc    Get parks owned by current user (or all if SUPER_ADMIN)
// @route   GET /api/parks/admin/my-parks
// @access  Private (PARK_ADMIN, SUPER_ADMIN)
export const getMyParks = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === 'PARK_ADMIN') {
    query.owners = req.user._id;
  }
  // SUPER_ADMIN sees all parks

  const parks = await Park.find(query)
    .populate('packages')
    .populate('owners', 'name email phone role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: parks.length,
    data: parks
  });
});

// @desc    Get park details by ID for admin/owner management
// @route   GET /api/parks/admin/:id
// @access  Private (PARK_ADMIN, SUPER_ADMIN)
export const getAdminParkById = asyncHandler(async (req, res) => {
  const park = await Park.findById(req.params.id)
    .populate('packages')
    .populate('activities')
    .populate('owners', 'name email phone role');

  if (!park) {
    return res.status(404).json({
      success: false,
      message: 'Park not found'
    });
  }

  // Verification: PARK_ADMIN can only view their own park
  if (req.user.role === 'PARK_ADMIN') {
    const isOwner = park.owners.some((owner) => 
      owner._id.toString() === req.user._id.toString() || owner.toString() === req.user._id.toString()
    );
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view or manage this park listing.'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: park
  });
});

// @desc    Create new park listing
// @route   POST /api/parks
// @access  Private (PARK_ADMIN, SUPER_ADMIN)
export const createPark = asyncHandler(async (req, res) => {
  const {
    name,
    tagline,
    description,
    city,
    district,
    state = 'Maharashtra',
    address,
    latitude,
    longitude,
    location,
    category,
    listingType = 'AUTHORIZED_THIRD_PARTY',
    isDirectManaged = false,
    heroImage,
    gallery = [],
    startingPricePaise = 0,
    operatingHours,
    facilities = [],
    activityNames = [],
    safetyGuidelines = [],
    cancellationPolicy,
    contact
  } = req.body;

  if (!name || !description || !city || !address || !heroImage || !category) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, description, city, address, category, heroImage.'
    });
  }

  // Format GeoJSON coordinates [longitude, latitude]
  let geoPoint;
  if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
    geoPoint = location;
  } else if (latitude !== undefined && longitude !== undefined) {
    geoPoint = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
  } else {
    // Default to Mumbai coordinates if none provided
    geoPoint = {
      type: 'Point',
      coordinates: [72.8777, 19.0760]
    };
  }

  // Unique slug generation
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;
  while (await Park.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Authorization policy for approval & owners
  let owners = [req.user._id];
  let approvalStatus = 'PENDING';

  if (req.user.role === 'SUPER_ADMIN') {
    approvalStatus = req.body.approvalStatus || 'APPROVED';
    if (req.body.owners && Array.isArray(req.body.owners) && req.body.owners.length > 0) {
      owners = req.body.owners;
    }
  }

  const newPark = new Park({
    name,
    slug,
    tagline: tagline || '',
    description,
    city,
    district: district || city,
    state,
    address,
    location: geoPoint,
    category,
    listingType,
    isDirectManaged: Boolean(isDirectManaged),
    heroImage,
    gallery: Array.isArray(gallery) ? gallery : [],
    startingPricePaise: Number(startingPricePaise) || 0,
    operatingHours: operatingHours || {
      open: '10:00 AM',
      close: '07:00 PM',
      days: 'Monday to Sunday',
      ridesClosing: '06:30 PM'
    },
    facilities: Array.isArray(facilities) 
      ? facilities 
      : (typeof facilities === 'string' ? facilities.split(',').map(s => s.trim()).filter(Boolean) : []),
    activityNames: Array.isArray(activityNames) 
      ? activityNames 
      : (typeof activityNames === 'string' ? activityNames.split(',').map(s => s.trim()).filter(Boolean) : []),
    safetyGuidelines: Array.isArray(safetyGuidelines) 
      ? safetyGuidelines 
      : (typeof safetyGuidelines === 'string' ? safetyGuidelines.split('\n').map(s => s.trim()).filter(Boolean) : []),
    cancellationPolicy: cancellationPolicy || 'Free cancellation up to 48 hours prior to booking date.',
    contact: contact || {},
    approvalStatus,
    isActive: true,
    owners
  });

  const savedPark = await newPark.save();

  res.status(201).json({
    success: true,
    message: approvalStatus === 'APPROVED' 
      ? 'Park listing published successfully!' 
      : 'Park listing submitted successfully and is pending administrator approval.',
    data: savedPark
  });
});

// @desc    Update park listing
// @route   PUT /api/parks/:id
// @access  Private (PARK_ADMIN, SUPER_ADMIN)
export const updatePark = asyncHandler(async (req, res) => {
  const park = await Park.findById(req.params.id);

  if (!park) {
    return res.status(404).json({
      success: false,
      message: 'Park not found'
    });
  }

  // Authorization check
  if (req.user.role === 'PARK_ADMIN') {
    const isOwner = park.owners.some((owner) => owner.toString() === req.user._id.toString());
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this park listing.'
      });
    }
  }

  const {
    name,
    tagline,
    description,
    city,
    district,
    state,
    address,
    latitude,
    longitude,
    location,
    category,
    listingType,
    isDirectManaged,
    heroImage,
    gallery,
    startingPricePaise,
    operatingHours,
    facilities,
    activityNames,
    safetyGuidelines,
    cancellationPolicy,
    contact
  } = req.body;

  // Update text & scalar fields
  if (name && name !== park.name) {
    park.name = name;
    // Don't modify slug if established, but if required we can keep original slug for SEO
  }
  if (tagline !== undefined) park.tagline = tagline;
  if (description !== undefined) park.description = description;
  if (city !== undefined) park.city = city;
  if (district !== undefined) park.district = district;
  if (state !== undefined) park.state = state;
  if (address !== undefined) park.address = address;
  if (category !== undefined) park.category = category;
  if (listingType !== undefined) park.listingType = listingType;
  if (isDirectManaged !== undefined) park.isDirectManaged = Boolean(isDirectManaged);
  if (heroImage !== undefined) park.heroImage = heroImage;
  if (startingPricePaise !== undefined) park.startingPricePaise = Number(startingPricePaise);
  if (cancellationPolicy !== undefined) park.cancellationPolicy = cancellationPolicy;

  // Location update
  if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
    park.location = location;
  } else if (latitude !== undefined && longitude !== undefined) {
    park.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
  }

  // Array & Object fields
  if (gallery !== undefined) {
    park.gallery = Array.isArray(gallery) ? gallery : [];
  }
  if (operatingHours !== undefined) {
    park.operatingHours = { ...park.operatingHours, ...operatingHours };
  }
  if (facilities !== undefined) {
    park.facilities = Array.isArray(facilities) 
      ? facilities 
      : (typeof facilities === 'string' ? facilities.split(',').map(s => s.trim()).filter(Boolean) : park.facilities);
  }
  if (activityNames !== undefined) {
    park.activityNames = Array.isArray(activityNames) 
      ? activityNames 
      : (typeof activityNames === 'string' ? activityNames.split(',').map(s => s.trim()).filter(Boolean) : park.activityNames);
  }
  if (safetyGuidelines !== undefined) {
    park.safetyGuidelines = Array.isArray(safetyGuidelines) 
      ? safetyGuidelines 
      : (typeof safetyGuidelines === 'string' ? safetyGuidelines.split('\n').map(s => s.trim()).filter(Boolean) : park.safetyGuidelines);
  }
  if (contact !== undefined) {
    park.contact = { ...park.contact, ...contact };
  }

  // Super Admin privileged overrides
  if (req.user.role === 'SUPER_ADMIN') {
    if (req.body.approvalStatus !== undefined) park.approvalStatus = req.body.approvalStatus;
    if (req.body.isActive !== undefined) park.isActive = Boolean(req.body.isActive);
    if (req.body.isFeatured !== undefined) park.isFeatured = Boolean(req.body.isFeatured);
    if (req.body.owners && Array.isArray(req.body.owners)) park.owners = req.body.owners;
  }

  const updatedPark = await park.save();

  res.status(200).json({
    success: true,
    message: 'Park listing updated successfully.',
    data: updatedPark
  });
});

// @desc    Change park approval status or active state (Super Admin only)
// @route   PATCH /api/parks/:id/status
// @access  Private (SUPER_ADMIN)
export const updateParkStatus = asyncHandler(async (req, res) => {
  const { approvalStatus, isActive, isFeatured } = req.body;

  const park = await Park.findById(req.params.id);
  if (!park) {
    return res.status(404).json({
      success: false,
      message: 'Park not found'
    });
  }

  if (approvalStatus) {
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval status. Must be PENDING, APPROVED, or REJECTED.'
      });
    }
    park.approvalStatus = approvalStatus;
  }

  if (isActive !== undefined) {
    park.isActive = Boolean(isActive);
  }

  if (isFeatured !== undefined) {
    park.isFeatured = Boolean(isFeatured);
  }

  const updatedPark = await park.save();

  res.status(200).json({
    success: true,
    message: `Park status updated to ${park.approvalStatus} (Active: ${park.isActive})`,
    data: updatedPark
  });
});

// @desc    Deactivate / delete park listing
// @route   DELETE /api/parks/:id
// @access  Private (SUPER_ADMIN)
export const deletePark = asyncHandler(async (req, res) => {
  const park = await Park.findById(req.params.id);
  if (!park) {
    return res.status(404).json({
      success: false,
      message: 'Park not found'
    });
  }

  // Soft-delete to preserve booking records and audit history
  park.isActive = false;
  await park.save();

  res.status(200).json({
    success: true,
    message: `Park '${park.name}' has been successfully deactivated.`
  });
});