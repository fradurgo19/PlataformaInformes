import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Solo disponible en desarrollo
router.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  }
  next();
});

// Resetear rate limiting (solo en desarrollo)
router.post('/reset-rate-limit', (req, res) => {
  try {
    // Limpiar el rate limiting reiniciando el servidor
    // En una implementación más robusta, podrías usar Redis o similar
    res.json({
      success: true,
      message: 'Rate limiting reset. Please restart the server for changes to take effect.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Obtener información de desarrollo
router.get('/info', (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 