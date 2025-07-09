import { Request, Response, NextFunction } from 'express';

// Interfaz para métricas
export interface Metrics {
  totalRequests: number;
  requestsPerMinute: { [key: string]: number };
  responseTimes: number[];
  errorCount: number;
  activeUsers: Set<string>;
  endpoints: { [key: string]: number };
}

class MetricsCollector {
  private metrics: Metrics;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      totalRequests: 0,
      requestsPerMinute: {},
      responseTimes: [],
      errorCount: 0,
      activeUsers: new Set(),
      endpoints: {}
    };

    // Limpiar métricas por minuto cada minuto
    setInterval(() => {
      this.metrics.requestsPerMinute = {};
    }, 60000);
  }

  // Middleware para recopilar métricas
  collectMetrics(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const endpoint = `${req.method} ${req.path}`;
    const userId = (req as any).user?.id || 'anonymous';

    // Incrementar contadores
    this.metrics.totalRequests++;
    this.metrics.activeUsers.add(userId);
    
    if (this.metrics.endpoints[endpoint]) {
      this.metrics.endpoints[endpoint]++;
    } else {
      this.metrics.endpoints[endpoint] = 1;
    }

    // Contar requests por minuto
    const minute = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    if (this.metrics.requestsPerMinute[minute]) {
      this.metrics.requestsPerMinute[minute]++;
    } else {
      this.metrics.requestsPerMinute[minute] = 1;
    }

    // Interceptar respuesta para medir tiempo
    const originalSend = res.send;
    const self = this;
    res.send = function(body: any) {
      const responseTime = Date.now() - startTime;
      self.metrics.responseTimes.push(responseTime);
      
      // Mantener solo los últimos 1000 tiempos de respuesta
      if (self.metrics.responseTimes.length > 1000) {
        self.metrics.responseTimes = self.metrics.responseTimes.slice(-1000);
      }

      // Contar errores
      if (res.statusCode >= 400) {
        self.metrics.errorCount++;
      }

      return originalSend.call(this, body);
    };

    next();
  }

  // Obtener métricas
  getMetrics(): any {
    const avgResponseTime = this.metrics.responseTimes.length > 0
      ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length
      : 0;

    const uptime = Date.now() - this.startTime;

    return {
      uptime: {
        total: uptime,
        formatted: this.formatUptime(uptime)
      },
      requests: {
        total: this.metrics.totalRequests,
        perMinute: this.metrics.requestsPerMinute,
        averagePerMinute: this.calculateAverageRequestsPerMinute()
      },
      performance: {
        averageResponseTime: Math.round(avgResponseTime),
        minResponseTime: Math.min(...this.metrics.responseTimes),
        maxResponseTime: Math.max(...this.metrics.responseTimes),
        responseTimePercentiles: this.calculatePercentiles()
      },
      errors: {
        total: this.metrics.errorCount,
        rate: this.metrics.totalRequests > 0 
          ? (this.metrics.errorCount / this.metrics.totalRequests * 100).toFixed(2) + '%'
          : '0%'
      },
      users: {
        active: this.metrics.activeUsers.size
      },
      endpoints: this.metrics.endpoints
    };
  }

  // Calcular percentiles de tiempo de respuesta
  private calculatePercentiles(): any {
    if (this.metrics.responseTimes.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0 };
    }

    const sorted = [...this.metrics.responseTimes].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      p50: sorted[Math.floor(len * 0.5)],
      p90: sorted[Math.floor(len * 0.9)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)]
    };
  }

  // Calcular promedio de requests por minuto
  private calculateAverageRequestsPerMinute(): number {
    const minutes = Object.keys(this.metrics.requestsPerMinute).length;
    if (minutes === 0) return 0;

    const totalRequests = Object.values(this.metrics.requestsPerMinute)
      .reduce((sum, count) => sum + count, 0);
    
    return Math.round(totalRequests / minutes);
  }

  // Formatear tiempo de actividad
  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Resetear métricas
  reset(): void {
    this.metrics = {
      totalRequests: 0,
      requestsPerMinute: {},
      responseTimes: [],
      errorCount: 0,
      activeUsers: new Set(),
      endpoints: {}
    };
    this.startTime = Date.now();
  }
}

export const metricsCollector = new MetricsCollector();
export default metricsCollector; 