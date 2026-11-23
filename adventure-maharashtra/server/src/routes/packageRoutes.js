import express from 'express';
import {
  getPackagesByPark,
  createPackage,
  updatePackage,
  deletePackage
} from '../controllers/packageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public package listing for park
router.get('/park/:parkId', getPackagesByPark);

// Partner / Super Admin package management
router.post('/', protect, authorize('PARK_ADMIN', 'SUPER_ADMIN'), createPackage);
router.put('/:id', protect, authorize('PARK_ADMIN', 'SUPER_ADMIN'), updatePackage);
router.delete('/:id', protect, authorize('PARK_ADMIN', 'SUPER_ADMIN'), deletePackage);

export default router;