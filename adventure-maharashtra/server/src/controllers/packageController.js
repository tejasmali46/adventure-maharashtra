import Package from '../models/Package.js';
import Park from '../models/Park.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper to recalculate park's startingPricePaise based on active packages
async function updateParkStartingPrice(parkId) {
  const activePackages = await Package.find({ park: parkId, status: 'ACTIVE' }).sort({ pricePaise: 1 });
  if (activePackages.length > 0) {
    await Park.findByIdAndUpdate(parkId, { startingPricePaise: activePackages[0].pricePaise });
  }
}

// @desc    Get all packages for a specific park
// @route   GET /api/packages/park/:parkId
// @access  Public / Partner
export const getPackagesByPark = asyncHandler(async (req, res) => {
  const { parkId } = req.params;

  const packages = await Package.find({ park: parkId }).sort({ pricePaise: 1 });

  res.status(200).json({
    success: true,
    count: packages.length,
    data: packages
  });
});

// @desc    Create new package pass for a park
// @route   POST /api/packages
// @access  Private (PARK_ADMIN, SUPER_ADMIN)
export const createPackage = asyncHandler(async (req, res) => {
  const {
    park: parkId,
    name,
    description,
    pricePaise,
    includesExpress = false,
    visitorCategories,
    features = [],
    availabilityRules,
    status = 'ACTIVE'
  } = req.body;

  if (!parkId || !name || pricePaise === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide park ID, package name, and base price in paise.'
    });
  }

  const park = await Park.findById(parkId);
  if (!park) {
    return res.status(404).json({
      success: false,
      message: 'Associated park not found.'
    });
  }

  // Authorization check
  if (req.user.role === 'PARK_ADMIN') {
    const isOwner = park.owners.some((owner) => owner.toString() === req.user._id.toString());
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create packages for this park.'
      });
    }
  }

  const newPackage = new Package({
    park: park._id,
    name,
    description: description || name,
    pricePaise: Number(pricePaise),
    includesExpress: Boolean(includesExpress),
    visitorCategories: visitorCategories && visitorCategories.length > 0 
      ? visitorCategories 
      : [{ type: 'Standard Pass', pricePaise: Number(pricePaise) }],
    features: Array.isArray(features) 
      ? features 
      : (typeof features === 'string' ? features.split(',').map(s => s.trim()).filter(Boolean) : []),
    availabilityRules: availabilityRules || { maxDailyPasses: 500 },
    status
  });

  const savedPackage = await newPackage.save();

  // Add package reference to park if not already present
  if (!park.packages.includes(savedPackage._id)) {
    park.packages.push(savedPackage._id);
  }
  
  // Recalculate minimum starting price
  if (!park.startingPricePaise || savedPackage.pricePaise < park.startingPricePaise) {
    park.startingPricePaise = savedPackage.pricePaise;
  }
  await park.save();

  res.status(201).json({
    success: true,
    message: 'Package created successfully.',
    data: savedPackage
  });
});

// @desc    Update existing package
// @route   PUT /api/packages/:id
// @access  Private (PARK_ADMIN, SUPER_ADMIN)
export const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    return res.status(404).json({
      success: false,
      message: 'Package not found.'
    });
  }

  const park = await Park.findById(pkg.park);
  if (!park) {
    return res.status(404).json({
      success: false,
      message: 'Associated park not found.'
    });
  }

  // Authorization check
  if (req.user.role === 'PARK_ADMIN') {
    const isOwner = park.owners.some((owner) => owner.toString() === req.user._id.toString());
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update packages for this park.'
      });
    }
  }

  const {
    name,
    description,
    pricePaise,
    includesExpress,
    visitorCategories,
    features,
    availabilityRules,
    status
  } = req.body;

  if (name !== undefined) pkg.name = name;
  if (description !== undefined) pkg.description = description;
  if (pricePaise !== undefined) pkg.pricePaise = Number(pricePaise);
  if (includesExpress !== undefined) pkg.includesExpress = Boolean(includesExpress);
  if (visitorCategories !== undefined && Array.isArray(visitorCategories)) {
    pkg.visitorCategories = visitorCategories;
  }
  if (features !== undefined) {
    pkg.features = Array.isArray(features) 
      ? features 
      : (typeof features === 'string' ? features.split(',').map(s => s.trim()).filter(Boolean) : pkg.features);
  }
  if (availabilityRules !== undefined) {
    pkg.availabilityRules = { ...pkg.availabilityRules, ...availabilityRules };
  }
  if (status !== undefined) pkg.status = status;

  const updatedPackage = await pkg.save();

  // Recalculate park starting price
  await updateParkStartingPrice(park._id);

  res.status(200).json({
    success: true,
    message: 'Package pass updated successfully.',
    data: updatedPackage
  });
});

// @desc    Deactivate package
// @route   DELETE /api/packages/:id
// @access  Private (PARK_ADMIN, SUPER_ADMIN)
export const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    return res.status(404).json({
      success: false,
      message: 'Package not found.'
    });
  }

  const park = await Park.findById(pkg.park);
  if (park && req.user.role === 'PARK_ADMIN') {
    const isOwner = park.owners.some((owner) => owner.toString() === req.user._id.toString());
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete packages for this park.'
      });
    }
  }

  // Soft delete by switching status to INACTIVE
  pkg.status = 'INACTIVE';
  await pkg.save();

  if (park) {
    await updateParkStartingPrice(park._id);
  }

  res.status(200).json({
    success: true,
    message: `Package '${pkg.name}' deactivated successfully.`
  });
});