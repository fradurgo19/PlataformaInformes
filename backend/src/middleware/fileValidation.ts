import { Request, Response, NextFunction } from 'express';

// Tipos de archivo permitidos (producción / móviles)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
  'image/heic',
  'image/heif',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.jpe', '.png', '.gif', '.webp', '.bmp', '.svg', '.heic', '.heif'];

// Tamaño máximo de archivo (30MB)
const MAX_FILE_SIZE = Number.parseInt(process.env.MAX_FILE_SIZE || '31457280', 10);

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return next();
    }

    const files = req.files as Express.Multer.File[];

    for (const file of files) {
      const fileName = file.originalname || 'unnamed';
      const lowerName = fileName.toLowerCase();
      const fileExtension = lowerName.includes('.')
        ? lowerName.substring(lowerName.lastIndexOf('.'))
        : '';

      const mime = (file.mimetype || '').toLowerCase();
      const mimeOk = ALLOWED_MIME_TYPES.includes(mime);
      const extOk = ALLOWED_EXTENSIONS.includes(fileExtension);
      // Some phones send JPG as application/octet-stream — only allow with image extension
      const octetStreamImage = mime === 'application/octet-stream' && extOk;

      if (!mimeOk && !extOk && !octetStreamImage) {
        return res.status(400).json({
          success: false,
          error: `File type not allowed: ${fileName}. Use JPEG, PNG, GIF or WebP.`
        });
      }

      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          success: false,
          error: `File too large: ${fileName}. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
        });
      }

      // Path traversal only (spaces and unicode names are OK)
      if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid filename'
        });
      }
    }

    next();
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({
      success: false,
      error: 'File validation failed'
    });
  }
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}; 