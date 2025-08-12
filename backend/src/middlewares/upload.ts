import multer from 'multer';
import path from 'path';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Define file filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images, videos, audio, and documents
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|mp3|wav|ogg|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: File type not supported!'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
});

export default upload; 