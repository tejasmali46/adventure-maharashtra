import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getDashboardStats
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected user routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/dashboard-stats', protect, getDashboardStats);

export default router;