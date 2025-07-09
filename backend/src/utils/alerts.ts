import logger from './logger';

// Tipos de alertas
export enum AlertLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface Alert {
  id: string;
  level: AlertLevel;
  message: string;
  details?: any;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

class AlertManager {
  private alerts: Alert[] = [];
  private errorThreshold = 10; // Número de errores antes de alertar
  private errorCount = 0;
  private lastErrorTime = 0;

  // Crear nueva alerta
  createAlert(level: AlertLevel, message: string, details?: any): Alert {
    const alert: Alert = {
      id: this.generateAlertId(),
      level,
      message,
      details,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    this.alerts.push(alert);
    this.logAlert(alert);
    return alert;
  }

  // Alertar sobre errores de API
  alertApiError(error: any, endpoint: string, userId?: number): void {
    this.errorCount++;
    const now = Date.now();

    // Alertar si hay muchos errores en poco tiempo
    if (this.errorCount >= this.errorThreshold && (now - this.lastErrorTime) < 60000) {
      this.createAlert(
        AlertLevel.ERROR,
        `High error rate detected: ${this.errorCount} errors in the last minute`,
        {
          endpoint,
          userId,
          errorCount: this.errorCount,
          lastError: error.message
        }
      );
      this.errorCount = 0;
    }

    this.lastErrorTime = now;

    // Alertar sobre errores críticos específicos
    if (error.message?.includes('database') || error.message?.includes('connection')) {
      this.createAlert(
        AlertLevel.CRITICAL,
        'Database connection issue detected',
        {
          endpoint,
          userId,
          error: error.message
        }
      );
    }
  }

  // Alertar sobre problemas de rendimiento
  alertPerformanceIssue(responseTime: number, endpoint: string): void {
    if (responseTime > 5000) { // Más de 5 segundos
      this.createAlert(
        AlertLevel.WARNING,
        'Slow response time detected',
        {
          endpoint,
          responseTime,
          threshold: 5000
        }
      );
    }
  }

  // Alertar sobre problemas de autenticación
  alertAuthIssue(ip: string, username: string, reason: string): void {
    this.createAlert(
      AlertLevel.WARNING,
      'Authentication issue detected',
      {
        ip,
        username,
        reason,
        timestamp: new Date().toISOString()
      }
    );
  }

  // Alertar sobre intentos de acceso no autorizado
  alertUnauthorizedAccess(ip: string, endpoint: string, userId?: number): void {
    this.createAlert(
      AlertLevel.WARNING,
      'Unauthorized access attempt',
      {
        ip,
        endpoint,
        userId,
        timestamp: new Date().toISOString()
      }
    );
  }

  // Alertar sobre problemas de archivos
  alertFileIssue(fileName: string, error: string, userId?: number): void {
    this.createAlert(
      AlertLevel.ERROR,
      'File processing issue',
      {
        fileName,
        error,
        userId,
        timestamp: new Date().toISOString()
      }
    );
  }

  // Obtener alertas activas
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  // Obtener todas las alertas
  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  // Reconocer alerta
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Limpiar alertas antiguas (más de 30 días)
  cleanupOldAlerts(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.alerts = this.alerts.filter(alert => {
      const alertDate = new Date(alert.timestamp);
      return alertDate > thirtyDaysAgo;
    });
  }

  // Generar ID único para alerta
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log de alerta
  private logAlert(alert: Alert): void {
    logger.audit({
      timestamp: alert.timestamp,
      level: 'AUDIT' as any,
      action: 'ALERT_CREATED',
      resource: 'SYSTEM',
      details: {
        alertId: alert.id,
        level: alert.level,
        message: alert.message
      }
    });
  }

  // Resetear contadores
  resetErrorCount(): void {
    this.errorCount = 0;
    this.lastErrorTime = 0;
  }

  // Obtener estadísticas de alertas
  getAlertStats(): any {
    const total = this.alerts.length;
    const active = this.alerts.filter(a => !a.acknowledged).length;
    const byLevel = this.alerts.reduce((acc, alert) => {
      acc[alert.level] = (acc[alert.level] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      total,
      active,
      byLevel,
      errorCount: this.errorCount
    };
  }
}

export const alertManager = new AlertManager();
export default alertManager; 