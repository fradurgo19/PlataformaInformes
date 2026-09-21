import { Request, Response, NextFunction } from 'express';

// Tipos de archivo permitidos (producción / móviles)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/heic',
  'image/heif',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.heic', '.heif'];

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

      const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);
      const extOk = ALLOWED_EXTENSIONS.includes(fileExtension);

      // Accept if MIME or extension is a known image (mobile browsers sometimes omit MIME)
      if (!mimeOk && !extOk) {
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