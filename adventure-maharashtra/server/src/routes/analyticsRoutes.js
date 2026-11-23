import express from 'express';
import {
  getPartnerAnalytics,
  getPlatformAnalytics
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/partner', protect, authorize('PARK_ADMIN', 'SUPER_ADMIN'), getPartnerAnalytics);
router.get('/platform', protect, authorize('SUPER_ADMIN'), getPlatformAnalytics);

export default router;