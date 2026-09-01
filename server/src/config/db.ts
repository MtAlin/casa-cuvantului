import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('=> Using existing MongoDB connection');
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);
    isConnected = !!conn.connections[0].readyState;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Using database: ${conn.connection.db?.databaseName || 'disciplebookplanner'}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    // Remove process.exit(1) to avoid killing the Vercel serverless function container entirely
    throw error;
  }
};

export default connectDB;
