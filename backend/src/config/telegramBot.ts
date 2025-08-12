import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import User from '../models/User';
import Message from '../models/Message';
import cloudinary from './cloudinary';
import axios from 'axios';
import dotenv from 'dotenv';
import { Server as SocketServer } from 'socket.io';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Hardcoded bot token as fallback
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8403478259:AAFF9TqAR4ymyGAue3aBAMh00HRSWEkrV4k';

// Ensure the token is not empty
if (!BOT_TOKEN || BOT_TOKEN.trim() === '') {
  console.error('ERROR: Telegram Bot Token is missing or empty!');
  // Write the token to a file for debugging
  const debugPath = path.join(__dirname, '../../debug-env.txt');
  fs.writeFileSync(debugPath, `TELEGRAM_BOT_TOKEN=${process.env.TELEGRAM_BOT_TOKEN}\n`);
  console.log(`Debug info written to ${debugPath}`);
  
  throw new Error('Telegram Bot Token is required. Please set it in the .env file.');
}

console.log('Using Telegram Bot Token in telegramBot.ts:', BOT_TOKEN);
const bot = new Telegraf(BOT_TOKEN);

// Upload to Cloudinary with optimization
const uploadToCloudinary = async (buffer: Buffer, resourceType: 'image' | 'video' | 'raw', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      resource_type: resourceType,
      folder: 'telegram-chat-app',
      ...options
    };
    
    // Add optimization for images
    if (resourceType === 'image') {
      uploadOptions.quality = 'auto';
      uploadOptions.fetch_format = 'auto';
      uploadOptions.flags = 'lossy';
      uploadOptions.strip = 'all';
    }
    
    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

export const setupBot = (io: SocketServer) => {
  // Handle start command
  bot.start(async (ctx) => {
    try {
      const telegramUser = ctx.from;
      if (!telegramUser || !telegramUser.id) {
        console.error('Invalid telegram user data:', telegramUser);
        await ctx.reply('Sorry, there was an error processing your request. Please try again later.');
        return;
      }
      
      const telegramId = telegramUser.id.toString();
      
      // Find or create user
      let user = await User.findOne({ telegramId });
      
      if (!user) {
        try {
          user = await User.create({
            telegramId,
            firstName: telegramUser.first_name || 'User',
            lastName: telegramUser.last_name || '',
            username: telegramUser.username || '',
          });
        } catch (createError) {
          console.error('Error creating user:', createError);
          // Try to find by telegramId again in case it was created in a race condition
          user = await User.findOne({ telegramId });
          if (!user) {
            throw new Error('Failed to create or find user');
          }
        }
      } else {
        // Update user info
        user.firstName = telegramUser.first_name || user.firstName;
        user.lastName = telegramUser.last_name || '';
        user.username = telegramUser.username || '';
        user.lastActive = new Date();
        await user.save();
      }
      
      const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
      await ctx.reply(`Hello ${fullName}, Fanzy Shop Support မှကြိုဆိုပါတယ် Fanzy Shop နဲ့ပတ်သတ်ပြီးဘာများကူညီပေးရမလဲရှင့်！`);
    } catch (error) {
      console.error('Error in start command:', error);
      await ctx.reply('Sorry, there was an error processing your request. Please try again later.');
    }
  });

  // Handle text messages
  bot.on('text', async (ctx) => {
    try {
      const telegramUser = ctx.from;
      if (!telegramUser || !telegramUser.id) {
        console.error('Invalid telegram user data:', telegramUser);
        await ctx.reply('Sorry, there was an error processing your message. Please try again later.');
        return;
      }
      
      const messageText = ctx.message.text;
      const telegramId = telegramUser.id.toString();
      
      // Find or create user
      let user = await User.findOne({ telegramId });
      
      if (!user) {
        try {
          user = await User.create({
            telegramId,
            firstName: telegramUser.first_name || 'User',
            lastName: telegramUser.last_name || '',
            username: telegramUser.username || '',
          });
        } catch (createError) {
          console.error('Error creating user:', createError);
          // Try to find by telegramId again in case it was created in a race condition
          user = await User.findOne({ telegramId });
          if (!user) {
            throw new Error('Failed to create or find user');
          }
        }
      }
      
      // Update last active
      user.lastActive = new Date();
      await user.save();
      
      // Create message
      const message = await Message.create({
        telegramMessageId: ctx.message.message_id,
        user: user._id,
        text: messageText,
        isFromAdmin: false,
        read: false,
      });
      
      // Populate user details
      await message.populate('user', 'telegramId firstName lastName username');
      
      // Emit to socket
      io.emit('newMessage', message);
      
      // No acknowledgment message
    } catch (error) {
      console.error('Error handling text message:', error);
      await ctx.reply('Sorry, there was an error processing your message. Please try again later.');
    }
  });

  // Handle photo messages
  bot.on('photo', async (ctx) => {
    try {
      const telegramUser = ctx.from;
      if (!telegramUser || !telegramUser.id) {
        console.error('Invalid telegram user data:', telegramUser);
        await ctx.reply('Sorry, there was an error processing your photo. Please try again later.');
        return;
      }
      
      const caption = ctx.message.caption || '';
      const photoSizes = ctx.message.photo;
      const largestPhoto = photoSizes[photoSizes.length - 1];
      
      // Get file link
      const fileLink = await ctx.telegram.getFileLink(largestPhoto.file_id);
      
      const telegramId = telegramUser.id.toString();
      
      // Find or create user
      let user = await User.findOne({ telegramId });
      
      if (!user) {
        try {
          user = await User.create({
            telegramId,
            firstName: telegramUser.first_name || 'User',
            lastName: telegramUser.last_name || '',
            username: telegramUser.username || '',
          });
        } catch (createError) {
          console.error('Error creating user:', createError);
          // Try to find by telegramId again in case it was created in a race condition
          user = await User.findOne({ telegramId });
          if (!user) {
            throw new Error('Failed to create or find user');
          }
        }
      }
      
      // Update last active
      user.lastActive = new Date();
      await user.save();
      
      // Upload to Cloudinary with optimization
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      // Use optimized upload function
      const cloudinaryUpload = await uploadToCloudinary(buffer, 'image', {
        transformation: [
          { width: 1000, crop: "limit" },
          { quality: "auto" }
        ]
      });
      
      // Create message
      const message = await Message.create({
        telegramMessageId: ctx.message.message_id,
        user: user._id,
        text: caption,
        attachments: [
          {
            type: 'image',
            url: (cloudinaryUpload as any).secure_url,
            fileSize: largestPhoto.file_size,
          },
        ],
        isFromAdmin: false,
        read: false,
      });
      
      // Populate user details
      await message.populate('user', 'telegramId firstName lastName username');
      
      // Emit to socket
      io.emit('newMessage', message);
      
      // No acknowledgment for photos
    } catch (error) {
      console.error('Error handling photo message:', error);
      await ctx.reply('Sorry, there was an error processing your photo. Please try again later.');
    }
  });

  // Handle video messages
  bot.on('video', async (ctx) => {
    try {
      const telegramUser = ctx.from;
      const caption = ctx.message.caption || '';
      const video = ctx.message.video;
      
      // Get file link
      const fileLink = await ctx.telegram.getFileLink(video.file_id);
      
      // Find or create user
      let user = await User.findOne({ telegramId: telegramUser.id.toString() });
      
      if (!user) {
        user = await User.create({
          telegramId: telegramUser.id.toString(),
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || '',
          username: telegramUser.username || '',
        });
      }
      
      // Update last active
      user.lastActive = new Date();
      await user.save();
      
      // Upload to Cloudinary with optimization
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      // Use optimized upload function
      const cloudinaryUpload = await uploadToCloudinary(buffer, 'video', {
        resource_type: 'video',
        eager: [
          { quality: 'auto', format: 'mp4' }
        ]
      });
      
      // Create message
      const message = await Message.create({
        telegramMessageId: ctx.message.message_id,
        user: user._id,
        text: caption,
        attachments: [
          {
            type: 'video',
            url: (cloudinaryUpload as any).secure_url,
            filename: video.file_name || 'video.mp4',
            fileSize: video.file_size,
            mimeType: video.mime_type,
          },
        ],
        isFromAdmin: false,
        read: false,
      });
      
      // Populate user details
      await message.populate('user', 'telegramId firstName lastName username');
      
      // Emit to socket
      io.emit('newMessage', message);
      
      // No acknowledgment for videos
    } catch (error) {
      console.error('Error handling video message:', error);
      await ctx.reply('Sorry, there was an error processing your video.');
    }
  });

  // Handle voice messages
  bot.on('voice', async (ctx) => {
    try {
      const telegramUser = ctx.from;
      const voice = ctx.message.voice;
      
      // Get file link
      const fileLink = await ctx.telegram.getFileLink(voice.file_id);
      
      // Find or create user
      let user = await User.findOne({ telegramId: telegramUser.id.toString() });
      
      if (!user) {
        user = await User.create({
          telegramId: telegramUser.id.toString(),
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || '',
          username: telegramUser.username || '',
        });
      }
      
      // Update last active
      user.lastActive = new Date();
      await user.save();
      
      // Upload to Cloudinary with optimization
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      // Use optimized upload function
      const cloudinaryUpload = await uploadToCloudinary(buffer, 'video', {
        resource_type: 'video',
        format: 'mp3'
      });
      
      // Create message
      const message = await Message.create({
        telegramMessageId: ctx.message.message_id,
        user: user._id,
        attachments: [
          {
            type: 'audio',
            url: (cloudinaryUpload as any).secure_url,
            fileSize: voice.file_size,
            mimeType: voice.mime_type,
          },
        ],
        isFromAdmin: false,
        read: false,
      });
      
      // Populate user details
      await message.populate('user', 'telegramId firstName lastName username');
      
      // Emit to socket
      io.emit('newMessage', message);
      
      // No acknowledgment for voice messages
    } catch (error) {
      console.error('Error handling voice message:', error);
      await ctx.reply('Sorry, there was an error processing your voice message.');
    }
  });

  // Handle document/file messages
  bot.on('document', async (ctx) => {
    try {
      const telegramUser = ctx.from;
      const caption = ctx.message.caption || '';
      const document = ctx.message.document;
      
      // Get file link
      const fileLink = await ctx.telegram.getFileLink(document.file_id);
      
      // Find or create user
      let user = await User.findOne({ telegramId: telegramUser.id.toString() });
      
      if (!user) {
        user = await User.create({
          telegramId: telegramUser.id.toString(),
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || '',
          username: telegramUser.username || '',
        });
      }
      
      // Update last active
      user.lastActive = new Date();
      await user.save();
      
      // Determine if it's an image file by mime type
      const isImage = document.mime_type && document.mime_type.startsWith('image/');
      const resourceType = isImage ? 'image' : 'raw';
      
      // Upload to Cloudinary with optimization
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      // Use optimized upload function with appropriate options
      const uploadOptions = isImage ? {
        transformation: [
          { width: 1000, crop: "limit" },
          { quality: "auto" }
        ]
      } : {};
      
      const cloudinaryUpload = await uploadToCloudinary(buffer, resourceType, uploadOptions);
      
      // Create message
      const message = await Message.create({
        telegramMessageId: ctx.message.message_id,
        user: user._id,
        text: caption,
        attachments: [
          {
            type: isImage ? 'image' : 'file',
            url: (cloudinaryUpload as any).secure_url,
            filename: document.file_name || 'file',
            fileSize: document.file_size,
            mimeType: document.mime_type,
          },
        ],
        isFromAdmin: false,
        read: false,
      });
      
      // Populate user details
      await message.populate('user', 'telegramId firstName lastName username');
      
      // Emit to socket
      io.emit('newMessage', message);
      
      // No acknowledgment for files
    } catch (error) {
      console.error('Error handling document message:', error);
      await ctx.reply('Sorry, there was an error processing your file.');
    }
  });

  // Launch bot
  bot.launch().then(() => {
    console.log('Telegram bot started');
  }).catch((err) => {
    console.error('Error starting Telegram bot:', err);
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
};

export default setupBot; 