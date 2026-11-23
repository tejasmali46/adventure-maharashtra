import express from 'express';
import {
  getParkReviews,
  createReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/park/:parkId', getParkReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

export default router;