import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure storage (memory)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure upload - Ajustado para Vercel (límite de 4.5MB por request)
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '1048576'), // 1MB por archivo (optimizado para Vercel)
    files: 20, // Max 20 archivos por request (reducido para Vercel)
    fieldSize: 4 * 1024 * 1024 // 4MB límite total del payload
  }
});

// Error handling middleware
export const handleUploadError = (error: Error, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 1MB per file. Please compress your images before uploading.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 20 files per request. Please upload photos in smaller batches.'
      });
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
      return res.status(413).json({
        success: false,
        error: 'Request too large. Please reduce the number of photos or compress them more.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field in request'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only image files are allowed'
    });
  }
  
  next(error);
}; 