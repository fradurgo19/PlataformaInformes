import { Request, Response, NextFunction } from 'express';

// Tipos de archivo permitidos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Tamaño máximo de archivo (10MB)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760');

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(); // No hay archivos, continuar
    }

    const files = req.files as Express.Multer.File[];
    
    for (const file of files) {
      // Validar tipo MIME
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `File type not allowed: ${file.originalname}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
        });
      }

      // Validar tamaño
      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          success: false,
          error: `File too large: ${file.originalname}. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
        });
      }

      // Validar nombre de archivo (prevenir path traversal)
      const fileName = file.originalname;
      if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid filename'
        });
      }

      // Validar extensión
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          error: `File extension not allowed: ${fileExtension}. Allowed extensions: ${allowedExtensions.join(', ')}`
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
  // Remover caracteres peligrosos
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}; 