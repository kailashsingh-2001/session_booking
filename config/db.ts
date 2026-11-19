import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in the .env file');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
};