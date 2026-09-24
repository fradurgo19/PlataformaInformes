import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Middleware que no limita nada (solo en desarrollo)
const noLimit = (_req: Request, _res: Response, next: NextFunction) => next();

const isDev = process.env.NODE_ENV === 'development';

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Rate limiter general para todas las rutas
export const generalLimiter = isDev
  ? noLimit
  : rateLimit({
      windowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max: parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 300),
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

/**
 * Auth brute-force protection — apply ONLY to /login and /register.
 * Do not mount on the whole /api/auth router (profile/users would burn the budget).
 */
export const authLimiter = isDev
  ? noLimit
  : rateLimit({
      windowMs: parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      // Reasonable for shared NAT / offices; successful logins do not count
      max: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 30),
      skipSuccessfulRequests: true,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many login attempts, please try again later.',
      },
      handler: (req, res, _next, options) => {
        const retryAfterSec = Math.ceil(options.windowMs / 1000);
        res.setHeader('Retry-After', String(retryAfterSec));
        res.status(options.statusCode).json({
          success: false,
          error: `Too many login attempts. Please wait about ${Math.ceil(retryAfterSec / 60)} minute(s) and try again.`,
        });
      },
    });

// Rate limiter para subida de archivos
export const uploadLimiter = isDev
  ? noLimit
  : rateLimit({
      windowMs: 60 * 1000,
      max: parsePositiveInt(process.env.UPLOAD_RATE_LIMIT_MAX, 30),
      message: {
        success: false,
        error: 'Too many file uploads, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
