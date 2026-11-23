import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('=======================================================');
      console.log('  ADVENTURE MAHARASHTRA API SERVER                     ');
      console.log(`  Environment:  ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port:         ${PORT}                                 `);
      console.log(`  Health Check: http://localhost:${PORT}/api/health     `);
      console.log(`  Parks API:    http://localhost:${PORT}/api/parks      `);
      console.log(`  Activities:   http://localhost:${PORT}/api/activities `);
      console.log(`  Destinations: http://localhost:${PORT}/api/destinations `);
      console.log(`  Coupons:      http://localhost:${PORT}/api/coupons    `);
      console.log('=======================================================');
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => console.log('HTTP server closed'));
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();