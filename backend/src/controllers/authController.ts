import { Request, Response } from 'express';
import { checkCredentials, generateToken } from '../middleware/auth';

// Login controller
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ error: 'Please provide username and password' });
      return;
    }

    // Check credentials
    const isValid = checkCredentials(username, password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token - using a random ID for the admin user
    const adminId = 'admin-' + Date.now();
    const token = generateToken(adminId);

    // Return token
    res.status(200).json({
      token,
      user: {
        id: adminId,
        username,
        isAdmin: true
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Verify token and return user
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is already attached to req by the auth middleware
    res.status(200).json({
      user: {
        id: req.user.id,
        isAdmin: true
      }
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
}; 