import express from 'express';
import {
  getTicketByReference,
  getTicketsForBooking,
  scanGateTicket,
  getParkScanHistory
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Customer & Staff Ticket Access
router.get('/ref/:ticketReference', protect, getTicketByReference);
router.get('/booking/:bookingId', protect, getTicketsForBooking);

// Turnstile Scanner & History (Staff & Super Admin)
router.post('/scan', protect, authorize('PARK_ADMIN', 'SUPER_ADMIN'), scanGateTicket);
router.get('/history/:parkId', protect, authorize('PARK_ADMIN', 'SUPER_ADMIN'), getParkScanHistory);

export default router;