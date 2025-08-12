import express from 'express';
import { uploadFile } from '../controllers/uploadController';
import upload from '../middlewares/upload';

const router = express.Router();

// Upload a file
router.post('/', upload.single('file'), uploadFile);

export default router; 