import multer from 'multer';
import { Request } from 'express';

// Configure storage (memory)
const storage = multer.memoryStorage();

const IMAGE_EXT = /\.(jpe?g|jpe|png|gif|webp|bmp|svg|heic|heif)$/i;

// File filter — accept by MIME or extension (phones often send empty/octet-stream for JPG)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const mime = (file.mimetype || '').toLowerCase();
  const name = file.originalname || '';
  const mimeOk = mime.startsWith('image/');
  const extOk = IMAGE_EXT.test(name);
  const octetOk = mime === 'application/octet-stream' && extOk;

  if (mimeOk || extOk || octetOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE || '31457280', 10), // 30MB por archivo
    files: 100 // Max 100 archivos por request
  }
});

// Error handling middleware
export const handleUploadError = (error: Error, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 30MB per file'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 100 files per request'
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