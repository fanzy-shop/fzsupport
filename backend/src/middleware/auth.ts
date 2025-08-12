import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'fanzyshopsupportsecretkey';

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user: { id: string } };
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Login credentials check
export const checkCredentials = (username: string, password: string): boolean => {
  // Check against hardcoded credentials
  return username === 'thonewathan' && password === 'Facai8898@';
};

// Generate JWT token
export const generateToken = (userId: string): string => {
  const payload = {
    user: {
      id: userId
    }
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Add user property to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
} 