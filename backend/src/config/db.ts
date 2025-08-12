import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Hardcoded MongoDB URI as fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:tUdtGYerXLrUdTUwfUSYDGICJAchemiO@interchange.proxy.rlwy.net:44145';

const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to MongoDB with URI:', MONGODB_URI);
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB; 