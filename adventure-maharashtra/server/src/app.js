import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import parkRoutes from './routes/parkRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import authRoutes from './routes/authRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Adventure Maharashtra API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Resource Routes
app.use('/api/auth', authRoutes);
app.use('/api/parks', parkRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on this server.`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;