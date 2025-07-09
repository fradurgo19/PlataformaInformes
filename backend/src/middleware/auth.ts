import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types';

interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
    return;
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret';
  
  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
      return;
    }
    
    (req as any).user = user;
    next();
    return;
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
      return;
    }

    // En desarrollo, permitir acceso a cualquier usuario autenticado
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Bypassing role check for user: ${req.user.username} (role: ${req.user.role})`);
      next();
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
}; 