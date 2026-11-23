import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'adventure_maharashtra_super_secure_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken({
    id: user._id,
    role: user.role,
    email: user.normalizedEmail
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  };

  res.cookie('adv_auth_token', token, cookieOptions);

  // Return user without password
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    isVerified: user.isVerified || false,
    status: user.status || 'ACTIVE'
  };

  res.status(statusCode).json({
    success: true,
    message,
    token, // Also return token in JSON so mobile or non-cookie clients can use Authorization header
    user: safeUser
  });
};

export const clearTokenResponse = (res, message = 'Logged out successfully') => {
  res.cookie('adv_auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });

  res.status(200).json({
    success: true,
    message
  });
};