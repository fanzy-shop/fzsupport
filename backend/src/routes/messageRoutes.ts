import express from 'express';
import {
  getUserMessages,
  getUsersWithLatestMessage,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
} from '../controllers/messageController';

const router = express.Router();

// Get all users with their latest message
router.get('/users', getUsersWithLatestMessage);

// Get all messages for a specific user
router.get('/users/:userId/messages', getUserMessages);

// Send message to a user
router.post('/users/:userId/messages', sendMessage);

// Mark messages as read
router.put('/users/:userId/read', markMessagesAsRead);

// Delete a message
router.put('/users/message/:messageId', deleteMessage);

export default router; 