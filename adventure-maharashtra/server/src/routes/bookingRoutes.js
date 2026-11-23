import express from 'express';
import {
  calculatePricing,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Real-time server-side price calculation
router.post('/calculate', calculatePricing);

// Protected booking endpoints
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

export default router;