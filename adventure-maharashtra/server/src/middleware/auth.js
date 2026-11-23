import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';
import asyncHandler from '../utils/asyncHandler.js';

// Protect routes - requires valid authenticated user
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check cookies first (standard browser flow)
  if (req.cookies && req.cookies.adv_auth_token) {
    token = req.cookies.adv_auth_token;
  }
  // 2. Check Authorization Bearer header (API/mobile flow)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to access this feature.'
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this session no longer exists.'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended or pending verification. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
});

// Grant access to specific roles only
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role || 'ANONYMOUS'}' is not authorized to access this route.`
      });
    }
    next();
  };
};

// Optional authentication - populates req.user if token present, but doesn't block
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.adv_auth_token) {
    token = req.cookies.adv_auth_token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user && user.status === 'ACTIVE') {
        req.user = user;
      }
    } catch (e) {
      // Ignore token errors for optional auth
    }
  }
  next();
});