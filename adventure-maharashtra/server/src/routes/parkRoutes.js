import express from 'express';
import {
  getParks,
  getParkBySlug,
  getFeaturedParks,
  checkParkAvailability,
  getMyParks,
  getAdminParkById,
  createPark,
  updatePark,
  updateParkStatus,
  deletePark
} from '../controllers/parkController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getParks);
router.get('/featured', getFeaturedParks);

// Admin & Partner Protected Routes (must be declared BEFORE /:slug)
router.get('/admin/my-parks', protect, authorize('PARK_ADMIN', 'SUPER_ADMIN'), getMyParks);
router.get('/admin/:id', protect, authorize('PARK_ADMIN', 'SUPER_ADMIN'), getAdminParkById);
router.post('/', protect, authorize('PARK_ADMIN', 'SUPER_ADMIN'), createPark);
router.put('/:id', protect, authorize('PARK_ADMIN', 'SUPER_ADMIN'), updatePark);
router.patch('/:id/status', protect, authorize('SUPER_ADMIN'), updateParkStatus);
router.delete('/:id', protect, authorize('SUPER_ADMIN'), deletePark);

// Public slug endpoints
router.get('/:slug', getParkBySlug);
router.get('/:slug/availability', checkParkAvailability);

export default router;