import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading environment variables from: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath)}`);
dotenv.config({ path: envPath });

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:tUdtGYerXLrUdTUwfUSYDGICJAchemiO@interchange.proxy.rlwy.net:44145';

async function fixUserSchema() {
  try {
    console.log(`Connecting to MongoDB with URI: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Drop the problematic index
    try {
      await db.collection('users').dropIndex('chatId_1');
      console.log('Successfully dropped the chatId_1 index');
    } catch (error) {
      console.log('Index chatId_1 does not exist or could not be dropped:', error);
    }

    // Update all users to ensure they have telegramId instead of chatId
    const result = await db.collection('users').updateMany(
      { chatId: { $exists: true }, telegramId: { $exists: false } },
      [{ $set: { telegramId: '$chatId' } }]
    );
    console.log(`Updated ${result.modifiedCount} users to have telegramId`);

    // Set null chatId to undefined to avoid duplicate key errors
    const nullResult = await db.collection('users').updateMany(
      { chatId: null },
      { $unset: { chatId: "" } }
    );
    console.log(`Removed null chatId from ${nullResult.modifiedCount} users`);

    console.log('User schema fixed successfully');
  } catch (error) {
    console.error('Error fixing user schema:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixUserSchema(); 