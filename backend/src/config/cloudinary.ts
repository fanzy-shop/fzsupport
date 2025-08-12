import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Hardcoded values as fallback
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dhsicxmav';
const API_KEY = process.env.CLOUDINARY_API_KEY || '544442577926141';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'gjT3hpeFQUuTdhyxIieXEVFMvLE';

console.log('Using Cloudinary config:', { cloud_name: CLOUD_NAME });

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export default cloudinary; 