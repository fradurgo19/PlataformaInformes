import fs from 'fs';
import path from 'path';

// Tipos de log
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  AUDIT = 'AUDIT'
}

// Interfaz para eventos de auditoría
export interface AuditEvent {
  timestamp: string;
  level: LogLevel;
  userId?: number;
  username?: string;
  action: string;
  resource: string;
  resourceId?: string | number;
  details?: any;
  ip?: string;
  userAgent?: string;
}

class Logger {
  private logDir: string;
  private auditLogPath: string;
  private errorLogPath: string;
  private infoLogPath: string;

  constructor() {
    // Usar /tmp en producción (Vercel), ../../logs en desarrollo/local
    this.logDir = process.env.LOG_DIR ||
      (process.env.NODE_ENV === 'production'
        ? '/tmp/backend/logs'
        : path.join(__dirname, '../../logs'));
    this.auditLogPath = path.join(this.logDir, 'audit.log');
    this.errorLogPath = path.join(this.logDir, 'error.log');
    this.infoLogPath = path.join(this.logDir, 'info.log');

    // Crear directorio de logs si no existe
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry) + '\n';
  }

  private writeToFile(filePath: string, message: string): void {
    try {
      fs.appendFileSync(filePath, message);
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  info(message: string, data?: any): void {
    const logMessage = this.formatMessage(LogLevel.INFO, message, data);
    this.writeToFile(this.infoLogPath, logMessage);
    console.log(`[INFO] ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    const logMessage = this.formatMessage(LogLevel.WARN, message, data);
    this.writeToFile(this.infoLogPath, logMessage);
    console.warn(`[WARN] ${message}`, data || '');
  }

  error(message: string, error?: any): void {
    const logMessage = this.formatMessage(LogLevel.ERROR, message, error);
    this.writeToFile(this.errorLogPath, logMessage);
    console.error(`[ERROR] ${message}`, error || '');
  }

  audit(event: AuditEvent): void {
    const logMessage = this.formatMessage(LogLevel.AUDIT, 'AUDIT EVENT', event);
    this.writeToFile(this.auditLogPath, logMessage);
    console.log(`[AUDIT] ${event.action} on ${event.resource}`, event);
  }

  // Métodos específicos para auditoría
  logUserLogin(userId: number, username: string, ip: string, userAgent: string): void {
    this.audit({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      userId,
      username,
      action: 'LOGIN',
      resource: 'AUTH',
      ip,
      userAgent
    });
  }

  logUserLogout(userId: number, username: string, ip: string): void {
    this.audit({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      userId,
      username,
      action: 'LOGOUT',
      resource: 'AUTH',
      ip
    });
  }

  logReportCreated(userId: number, username: string, reportId: number, reportTitle: string, ip: string): void {
    this.audit({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      userId,
      username,
      action: 'CREATE',
      resource: 'REPORT',
      resourceId: reportId,
      details: { title: reportTitle },
      ip
    });
  }

  logReportUpdated(userId: number, username: string, reportId: number, reportTitle: string, ip: string): void {
    this.audit({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      userId,
      username,
      action: 'UPDATE',
      resource: 'REPORT',
      resourceId: reportId,
      details: { title: reportTitle },
      ip
    });
  }

  logReportDeleted(userId: number, username: string, reportId: number, ip: string): void {
    this.audit({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      userId,
      username,
      action: 'DELETE',
      resource: 'REPORT',
      resourceId: reportId,
      ip
    });
  }

  logUserCreated(adminId: number, adminUsername: string, newUserId: number, newUsername: string, ip: string): void {
    this.audit({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      userId: adminId,
      username: adminUsername,
      action: 'CREATE',
      resource: 'USER',
      resourceId: newUserId,
      details: { newUsername },
      ip
    });
  }

  logUserUpdated(adminId: number, adminUsername: string, targetUserId: number, targetUsername: string, ip: string): void {
    this.audit({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      userId: adminId,
      username: adminUsername,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: targetUserId,
      details: { targetUsername },
      ip
    });
  }

  logUserDeleted(adminId: number, adminUsername: string, targetUserId: number, targetUsername: string, ip: string): void {
    this.audit({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      userId: adminId,
      username: adminUsername,
      action: 'DELETE',
      resource: 'USER',
      resourceId: targetUserId,
      details: { targetUsername },
      ip
    });
  }

  logFileUpload(userId: number, username: string, fileName: string, fileSize: number, ip: string): void {
    this.audit({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      userId,
      username,
      action: 'UPLOAD',
      resource: 'FILE',
      details: { fileName, fileSize },
      ip
    });
  }

  logPDFDownload(userId: number, username: string, reportId: number, ip: string): void {
    this.audit({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      userId,
      username,
      action: 'DOWNLOAD',
      resource: 'PDF',
      resourceId: reportId,
      ip
    });
  }
}

export const logger = new Logger();
export default logger; 