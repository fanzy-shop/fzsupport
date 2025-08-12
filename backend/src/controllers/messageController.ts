import { Request, Response } from 'express';
import Message, { IMessage } from '../models/Message';
import User from '../models/User';
import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables with explicit path
const envPath = path.resolve(__dirname, '../../.env');
console.log(`MessageController - Loading environment variables from: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath)}`);

dotenv.config({ path: envPath });

// Hardcoded bot token as fallback
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8403478259:AAFF9TqAR4ymyGAue3aBAMh00HRSWEkrV4k';

if (!BOT_TOKEN || BOT_TOKEN.trim() === '') {
  console.error('ERROR in messageController: Telegram Bot Token is missing or empty!');
  throw new Error('Telegram Bot Token is required. Please set it in the .env file.');
}

console.log('Using Telegram Bot Token in messageController:', BOT_TOKEN);

// Create a single bot instance to be used throughout the controller
const bot = new Telegraf(BOT_TOKEN);

// Get all messages for a specific user
export const getUserMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    console.log(`Getting messages for user: ${userId}`);
    
    const messages = await Message.find({ user: userId })
      .sort({ createdAt: 1 })
      .populate('user', 'telegramId firstName lastName username')
      .populate('replyTo');
    
    console.log(`Found ${messages.length} messages for user ${userId}`);
    res.status(200).json(messages);
  } catch (error: any) {
    console.error(`Error getting messages: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
};

// Get all users with their latest message
export const getUsersWithLatestMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Getting all users with latest messages');
    const users = await User.find().sort({ lastActive: -1 });
    
    const usersWithLatestMessage = await Promise.all(
      users.map(async (user) => {
        const latestMessage = await Message.findOne({ user: user._id })
          .sort({ createdAt: -1 })
          .limit(1);
        
        // Count only unread messages from the user (not from admin)
        const unreadCount = await Message.countDocuments({ 
          user: user._id, 
          read: false, 
          isFromAdmin: false 
        });
        
        return {
          ...user.toObject(),
          latestMessage: latestMessage || null,
          unreadCount: unreadCount,
        };
      })
    );
    
    console.log(`Found ${users.length} users`);
    res.status(200).json(usersWithLatestMessage);
  } catch (error: any) {
    console.error(`Error getting users: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
};

// Send message to a user via Telegram
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { text, attachments, replyToMessageId } = req.body;
    
    console.log(`Sending message to user ${userId}:`, { text, attachments, replyToMessageId });
    
    if (!text && (!attachments || attachments.length === 0)) {
      console.error('Message must contain text or attachments');
      res.status(400).json({ error: 'Message must contain text or attachments' });
      return;
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    console.log(`Found user: ${user.firstName} (${user.telegramId})`);
    
    // Create message object
    const messageData: any = {
      user: userId,
      text,
      attachments,
      isFromAdmin: true,
      read: false,
    };
    
    // If replying to a message, add the reference
    let replyToTelegramMessageId: number | undefined;
    if (replyToMessageId) {
      const replyToMessage = await Message.findById(replyToMessageId);
      if (replyToMessage) {
        messageData.replyTo = replyToMessageId;
        replyToTelegramMessageId = replyToMessage.telegramMessageId;
      }
    }
    
    // Send message via Telegram bot
    try {
      // Prepare options for Telegram API
      const telegramOptions: any = {};
      
      // Add reply_to_message_id if replying to a message
      if (replyToTelegramMessageId) {
        telegramOptions.reply_to_message_id = replyToTelegramMessageId;
      }
      
      // Send text if available
      let telegramMessageId;
      if (text) {
        console.log(`Sending text message to Telegram user ${user.telegramId}: ${text}`);
        const sentMessage = await bot.telegram.sendMessage(
          user.telegramId, 
          text, 
          telegramOptions
        );
        telegramMessageId = sentMessage.message_id;
        console.log('Text message sent successfully with ID:', telegramMessageId);
      }
      
      // Send attachments if available
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          console.log(`Sending ${attachment.type} attachment to Telegram user ${user.telegramId}: ${attachment.url}`);
          
          let sentMessage;
          switch (attachment.type) {
            case 'image':
              sentMessage = await bot.telegram.sendPhoto(user.telegramId, attachment.url, telegramOptions);
              break;
            case 'video':
              sentMessage = await bot.telegram.sendVideo(user.telegramId, attachment.url, telegramOptions);
              break;
            case 'audio':
              sentMessage = await bot.telegram.sendAudio(user.telegramId, attachment.url, telegramOptions);
              break;
            case 'file':
              sentMessage = await bot.telegram.sendDocument(
                user.telegramId, 
                attachment.url, 
                {
                  ...telegramOptions,
                  caption: attachment.filename || undefined,
                }
              );
              break;
            default:
              console.warn(`Unknown attachment type: ${attachment.type}`);
              break;
          }
          
          if (sentMessage && !telegramMessageId) {
            telegramMessageId = sentMessage.message_id;
          }
          
          console.log(`${attachment.type} attachment sent successfully`);
        }
      }
      
      // Add Telegram message ID to our message data
      if (telegramMessageId) {
        messageData.telegramMessageId = telegramMessageId;
      }
      
      // Create message in database
      const message = await Message.create(messageData);
      
      console.log(`Created message in database: ${message._id}`);
      console.log('All message content sent successfully');
      res.status(201).json(message);
    } catch (botError: any) {
      // If Telegram API fails, still save the message but mark the error
      console.error('Telegram API error:', botError);
      
      // Create message in database with error flag
      const message = await Message.create(messageData);
      
      res.status(201).json({ 
        ...message.toObject(), 
        telegramError: botError.message 
      });
    }
  } catch (error: any) {
    console.error(`Error sending message: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    console.log(`Marking messages as read for user ${userId}`);
    
    // Only mark messages from the user (not from admin) as read
    const result = await Message.updateMany(
      { user: userId, read: false, isFromAdmin: false },
      { read: true }
    );
    
    console.log(`Marked ${result.modifiedCount} messages as read for user ${userId}`);
    res.status(200).json({ success: true, count: result.modifiedCount });
  } catch (error: any) {
    console.error(`Error marking messages as read: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a message (actually delete from database)
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    console.log(`Deleting message: ${messageId}`);
    
    // Find the message first to get user info
    const message = await Message.findById(messageId).populate('user');
    
    if (!message) {
      console.error(`Message not found: ${messageId}`);
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    
    // Delete message from Telegram if it has a Telegram message ID
    if (message.telegramMessageId && message.user && typeof message.user === 'object' && 'telegramId' in message.user) {
      try {
        await bot.telegram.deleteMessage(message.user.telegramId, message.telegramMessageId);
        console.log(`Deleted message from Telegram: ${message.telegramMessageId}`);
      } catch (botError: any) {
        console.error('Error deleting message from Telegram:', botError);
        // Continue even if Telegram deletion fails
      }
    } else {
      // Notify the user via Telegram if the message is from the user
      if (!message.isFromAdmin && message.user && typeof message.user === 'object' && 'telegramId' in message.user) {
        try {
          const deleteText = `Admin deleted a message: "${message.text?.substring(0, 30)}${message.text && message.text.length > 30 ? '...' : ''}"`;
          await bot.telegram.sendMessage(message.user.telegramId, deleteText);
          console.log(`Deletion notification sent to Telegram user ${message.user.telegramId}`);
        } catch (botError: any) {
          console.error('Error sending deletion notification to Telegram:', botError);
        }
      }
    }
    
    // Actually delete the message from the database
    await Message.findByIdAndDelete(messageId);
    
    console.log(`Message deleted: ${messageId}`);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting message: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
};