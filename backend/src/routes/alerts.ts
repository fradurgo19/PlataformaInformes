import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import alertManager from '../utils/alerts';

const router = Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticateToken as any);
router.use(requireRole(['admin']) as any);

// Obtener alertas activas
router.get('/active', (req, res) => {
  try {
    const alerts = alertManager.getActiveAlerts();
    return res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Obtener todas las alertas
router.get('/', (req, res) => {
  try {
    const alerts = alertManager.getAllAlerts();
    return res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Obtener estadísticas de alertas
router.get('/stats', (req, res) => {
  try {
    const stats = alertManager.getAlertStats();
    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Reconocer alerta
router.put('/:id/acknowledge', (req, res) => {
  try {
    const { id } = req.params;
    const { acknowledgedBy } = req.body;
    const currentUser = (req as any).user;

    if (!acknowledgedBy) {
      return res.status(400).json({
        success: false,
        error: 'acknowledgedBy is required'
      });
    }

    const success = alertManager.acknowledgeAlert(id, acknowledgedBy);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Limpiar alertas antiguas
router.delete('/cleanup', (req, res) => {
  try {
    alertManager.cleanupOldAlerts();
    return res.json({
      success: true,
      message: 'Old alerts cleaned up successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 