import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Middleware que no limita nada (solo en desarrollo)
const noLimit = (req: Request, res: Response, next: NextFunction) => next();

const isDev = process.env.NODE_ENV === 'development';

// Rate limiter general para todas las rutas
export const generalLimiter = isDev ? noLimit : rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos por defecto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter específico para autenticación
export const authLimiter = isDev ? noLimit : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para subida de archivos
export const uploadLimiter = isDev ? noLimit : rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 uploads por minuto
  message: {
    success: false,
    error: 'Too many file uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 