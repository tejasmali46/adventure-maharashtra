import mongoose from 'mongoose';

export async function connectDB() {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/adventure_maharashtra';
  // On Windows, localhost can resolve to ::1 IPv6 and throw EACCES. Prefer IPv4 127.0.0.1
  if (uri.includes('localhost:27017')) {
    uri = uri.replace('localhost:27017', '127.0.0.1:27017');
  }
  
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB]: Connected successfully to ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Error]:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Disconnected]: Lost connection to database');
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Failed]: ${error.message}`);
    // Do not crash silently; allow caller to handle or exit gracefully
    throw error;
  }
}

export default connectDB;