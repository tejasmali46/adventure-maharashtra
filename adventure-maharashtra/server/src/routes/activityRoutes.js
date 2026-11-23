import express from 'express';
import {
  getActivities,
  getActivityBySlug
} from '../controllers/activityController.js';

const router = express.Router();

router.get('/', getActivities);
router.get('/:slug', getActivityBySlug);

export default router;