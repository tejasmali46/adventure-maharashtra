import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Favorite from '../models/Favorite.js';
import { sendTokenResponse, clearTokenResponse } from '../utils/token.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Register a new customer account
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, passwordConfirm, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide full name, email, and password.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters in length.'
    });
  }

  if (passwordConfirm && password !== passwordConfirm) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match.'
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ normalizedEmail });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email address already exists. Please log in.'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Security: Never trust client-supplied role on public registration
  const user = await User.create({
    name: name.trim(),
    email: email.trim(),
    normalizedEmail,
    passwordHash,
    phone: phone ? phone.trim() : '',
    role: 'CUSTOMER',
    isVerified: true, // auto-verified for smooth local onboarding
    status: 'ACTIVE'
  });

  sendTokenResponse(user, 201, res, 'Registration successful! Welcome to Adventure Maharashtra.');
});

// @desc    Login user with email & password
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.'
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ normalizedEmail });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password credentials.'
    });
  }

  // Verify password hash
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password credentials.'
    });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({
      success: false,
      message: 'Account is suspended or deactivated. Please contact support.'
    });
  }

  sendTokenResponse(user, 200, res, `Welcome back, ${user.name}!`);
});

// @desc    Logout current user & clear session cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = asyncHandler(async (req, res) => {
  clearTokenResponse(res, 'Successfully logged out.');
});

// @desc    Get currently authenticated user profile
// @route   GET /api/auth/me
// @access  Private (protect)
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// @desc    Update permitted profile fields
// @route   PUT /api/auth/profile
// @access  Private (protect)
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private (protect)
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both your current and new password.'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters.'
    });
  }

  if (newPasswordConfirm && newPassword !== newPasswordConfirm) {
    return res.status(400).json({
      success: false,
      message: 'New password confirmation does not match.'
    });
  }

  const user = await User.findById(req.user._id);

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password provided is incorrect.'
    });
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.'
  });
});

// @desc    Get customer dashboard metrics & summaries
// @route   GET /api/auth/dashboard-stats
// @access  Private (protect)
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const totalBookings = await Booking.countDocuments({ user: userId });
  const upcomingBookings = await Booking.countDocuments({
    user: userId,
    visitDate: { $gte: new Date() },
    bookingStatus: { $in: ['CONFIRMED', 'PENDING_PAYMENT'] }
  });
  const completedBookings = await Booking.countDocuments({
    user: userId,
    bookingStatus: 'COMPLETED'
  });
  const savedFavorites = await Favorite.countDocuments({ user: userId });

  // Recent 5 bookings
  const recentBookings = await Booking.find({ user: userId })
    .populate('park', 'name slug city heroImage category startingPricePaise')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalBookings,
        upcomingBookings,
        completedBookings,
        savedFavorites
      },
      recentBookings
    }
  });
});