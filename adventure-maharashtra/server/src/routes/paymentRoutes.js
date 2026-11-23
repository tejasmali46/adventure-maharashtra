import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  processBookingRefund,
  handleGatewayWebhook
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Order creation & cryptographic verification
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/:bookingId/refund', protect, processBookingRefund);

// Webhook listener
router.post('/webhook', handleGatewayWebhook);

export default router;