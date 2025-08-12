import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const file = req.file;
    const mimeType = file.mimetype;
    let resourceType = 'auto';
    
    // Determine resource type based on mimetype
    if (mimeType.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimeType.startsWith('video/')) {
      resourceType = 'video';
    } else if (mimeType.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary handles audio under video resource type
    } else {
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: resourceType as any,
      folder: 'telegram-chat-app',
    });

    // Remove file from local storage
    fs.unlinkSync(file.path);

    // Return the Cloudinary URL
    res.status(200).json({
      url: result.secure_url,
      type: resourceType === 'raw' ? 'file' : resourceType,
      filename: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
} 