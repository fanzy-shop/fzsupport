import express from 'express';
import { login, verifyToken } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Login route
router.post('/login', login);

// Verify token route (protected)
router.get('/verify', authenticate, verifyToken);

export default router; 