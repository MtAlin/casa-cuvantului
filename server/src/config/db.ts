import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Using database: ${conn.connection.db?.databaseName || 'disciplebookplanner'}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
    } else {
      console.error('❌ MongoDB Connection Error:', error);
    }
    console.error('❌ Server exiting due to database connection failure.');
    process.exit(1);
  }
};

export default connectDB;
