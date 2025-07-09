# 🚀 Preparación para Producción

## 📋 **PASO 1: Configuración de Variables de Entorno**

### Backend (.env)
```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_HOST=tu-servidor-db.com
DB_PORT=5432
DB_NAME=maquinaria_reports_prod
DB_USER=maquinaria_user_prod
DB_PASSWORD=tu_password_seguro_produccion

# JWT Configuration
JWT_SECRET=tu_super_secret_key_produccion_muy_segura_123456789
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=https://tu-dominio.com

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email-produccion@gmail.com
SMTP_PASS=tu-app-password-produccion

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```bash
# URL de la API (producción)
VITE_API_URL=https://tu-backend.com/api

# Configuración de la aplicación
VITE_APP_NAME=Plataforma de Informes de Maquinaria
VITE_APP_VERSION=1.0.0

# Configuración de producción
VITE_DEBUG=false
```

## 📋 **PASO 2: Configuración de Base de Datos**

### PostgreSQL en Producción
```sql
-- Crear base de datos
CREATE DATABASE maquinaria_reports_prod;

-- Crear usuario
CREATE USER maquinaria_user_prod WITH PASSWORD 'tu_password_seguro';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE maquinaria_reports_prod TO maquinaria_user_prod;

-- Conectar a la base de datos
\c maquinaria_reports_prod

-- Ejecutar schema
\i schema.sql

-- Insertar datos iniciales
\i seed-data.sql
```

### Backup y Restore
```bash
# Backup
pg_dump -h localhost -U maquinaria_user -d maquinaria_reports > backup.sql

# Restore en producción
psql -h tu-servidor-db.com -U maquinaria_user_prod -d maquinaria_reports_prod < backup.sql
```

## 📋 **PASO 3: Configuración del Servidor**

### Instalación de Dependencias
```bash
# Backend
cd backend
npm install --production
npm run build

# Frontend
npm install --production
npm run build
```

### Configuración de PM2 (Node.js)
```bash
# Instalar PM2
npm install -g pm2

# Archivo ecosystem.config.js
module.exports = {
  apps: [{
    name: 'maquinaria-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};

# Iniciar aplicación
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Configuración de Nginx
```nginx
# /etc/nginx/sites-available/maquinaria
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        root /var/www/maquinaria/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache estático
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Archivos subidos
    location /uploads {
        alias /var/www/maquinaria/backend/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

## 📋 **PASO 4: Configuración de SSL**

### Certbot (Let's Encrypt)
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renovar automáticamente
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📋 **PASO 5: Configuración de Monitoreo**

### Logs
```bash
# Crear directorio de logs
mkdir -p /var/log/maquinaria
chown -R www-data:www-data /var/log/maquinaria

# Configurar logrotate
sudo nano /etc/logrotate.d/maquinaria

/var/log/maquinaria/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### Métricas con Prometheus
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'maquinaria-backend'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
```

### Alertas con Grafana
```bash
# Instalar Grafana
sudo apt install grafana

# Configurar dashboard para métricas
# Importar dashboard desde Grafana.com
```

## 📋 **PASO 6: Configuración de Backup**

### Script de Backup Automático
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/maquinaria"
DB_NAME="maquinaria_reports_prod"
UPLOADS_DIR="/var/www/maquinaria/backend/uploads"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de base de datos
pg_dump -h localhost -U maquinaria_user_prod -d $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz $UPLOADS_DIR

# Backup de logs
tar -czf $BACKUP_DIR/logs_backup_$DATE.tar.gz /var/log/maquinaria

# Limpiar backups antiguos (mantener últimos 30 días)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completado: $DATE"
```

### Cron Job para Backup
```bash
# Agregar a crontab
sudo crontab -e

# Backup diario a las 2 AM
0 2 * * * /path/to/backup.sh
```

## 📋 **PASO 7: Configuración de Seguridad**

### Firewall
```bash
# Configurar UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3001/tcp  # Puerto backend solo local
sudo ufw enable
```

### Fail2ban
```bash
# Instalar fail2ban
sudo apt install fail2ban

# Configurar jail para nginx
sudo nano /etc/fail2ban/jail.local

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
```

### Actualizaciones Automáticas
```bash
# Configurar actualizaciones automáticas
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📋 **PASO 8: Configuración de CI/CD**

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        npm ci
        cd backend && npm ci
    
    - name: Run tests
      run: |
        cd backend && npm test
    
    - name: Build
      run: |
        npm run build
        cd backend && npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www/maquinaria
          git pull origin main
          npm install --production
          cd backend && npm install --production && npm run build
          pm2 restart maquinaria-backend
```

## 📋 **PASO 9: Verificación de Producción**

### Checklist de Verificación
- [ ] SSL certificado instalado y funcionando
- [ ] Base de datos conectada y funcionando
- [ ] Backend respondiendo en puerto 3001
- [ ] Frontend servido por Nginx
- [ ] Archivos estáticos siendo servidos
- [ ] Logs generándose correctamente
- [ ] Métricas disponibles en /metrics
- [ ] Backup funcionando
- [ ] Monitoreo configurado
- [ ] Alertas funcionando
- [ ] Rate limiting activo
- [ ] Validación de archivos funcionando
- [ ] Sanitización de datos activa

### Tests de Producción
```bash
# Test de conectividad
curl -I https://tu-dominio.com

# Test de API
curl -I https://tu-dominio.com/api/health

# Test de métricas
curl https://tu-dominio.com/metrics

# Test de SSL
openssl s_client -connect tu-dominio.com:443
```

## 📋 **PASO 10: Documentación**

### Documentación Técnica
- [ ] README actualizado
- [ ] Documentación de API
- [ ] Guía de troubleshooting
- [ ] Documentación de deployment
- [ ] Guía de mantenimiento

### Documentación de Usuario
- [ ] Manual de usuario
- [ ] Guía de administración
- [ ] FAQ
- [ ] Videos tutoriales

## 🎯 **CRITERIOS DE ÉXITO PARA PRODUCCIÓN**

### ✅ **Funcionalidad**
- [ ] Todas las funcionalidades funcionan en producción
- [ ] Performance aceptable (< 2s respuesta)
- [ ] Sin errores críticos

### ✅ **Seguridad**
- [ ] SSL configurado
- [ ] Firewall activo
- [ ] Rate limiting funcionando
- [ ] Validación de archivos activa
- [ ] Sanitización de datos activa

### ✅ **Monitoreo**
- [ ] Logs configurados
- [ ] Métricas disponibles
- [ ] Alertas funcionando
- [ ] Backup automático

### ✅ **Mantenimiento**
- [ ] CI/CD configurado
- [ ] Actualizaciones automáticas
- [ ] Documentación completa
- [ ] Plan de recuperación

## 🚨 **CONTINGENCIAS**

### Plan de Recuperación
1. **Backup automático** cada día
2. **Rollback** a versión anterior si es necesario
3. **Monitoreo** 24/7
4. **Alertas** para problemas críticos

### Contactos de Emergencia
- **Desarrollador:** [Tu contacto]
- **DevOps:** [Contacto DevOps]
- **Hosting:** [Contacto hosting]

## 📞 **SOPORTE EN PRODUCCIÓN**

### Logs Importantes
- `/var/log/nginx/error.log`
- `/var/log/maquinaria/audit.log`
- `/var/log/maquinaria/error.log`
- `pm2 logs maquinaria-backend`

### Comandos Útiles
```bash
# Reiniciar aplicación
pm2 restart maquinaria-backend

# Ver logs
pm2 logs maquinaria-backend

# Ver estado
pm2 status

# Reiniciar nginx
sudo systemctl restart nginx

# Verificar SSL
sudo certbot certificates
``` 