# 🔧 Variables de Entorno para Railway

## 📋 Variables que debes configurar en Railway Dashboard

### 🖥️ **Backend Service Variables**

```bash
# Server Configuration
NODE_ENV=production
PORT=3001

# JWT Configuration (¡IMPORTANTE: Cambia este secret!)
JWT_SECRET=tu_super_secret_key_produccion_muy_seguro_123456789_abcdefghijklmnopqrstuvwxyz
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration (actualizar con tu dominio de Railway)
CORS_ORIGIN=https://tu-frontend-url.railway.app

# Security Configuration - Rate limiting activado en producción
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (opcional - configurar según tu proveedor)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

### 🗄️ **Database Variables** (Railway las proporciona automáticamente)

```bash
# Railway PostgreSQL - Se configuran automáticamente
DATABASE_HOST=containers-us-west-XX.railway.app
DATABASE_PORT=5432
DATABASE_NAME=railway
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password_railway
```

### 🌐 **Frontend Service Variables**

```bash
# API URL - Actualizar con tu URL de backend de Railway
VITE_API_URL=https://tu-backend-url.railway.app/api
```

---

## 🚀 Pasos para Configurar en Railway

### **1. Backend Service**
1. Ve a tu proyecto en Railway
2. Selecciona el servicio **Backend**
3. Ve a **Variables**
4. Agrega cada variable de la sección "Backend Service Variables"

### **2. Frontend Service**
1. Selecciona el servicio **Frontend**
2. Ve a **Variables**
3. Agrega `VITE_API_URL` con la URL de tu backend

### **3. Database Service**
1. Railway configura automáticamente las variables de base de datos
2. Las variables `DATABASE_*` se inyectan automáticamente

---

## ⚠️ **IMPORTANTE - Seguridad**

### **JWT_SECRET**
- **NUNCA** uses el mismo secret de desarrollo
- Genera un secret seguro de al menos 32 caracteres
- Puedes usar: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### **CORS_ORIGIN**
- Debe ser la URL exacta de tu frontend en Railway
- Formato: `https://tu-frontend-url.railway.app`
- Sin barra final

### **VITE_API_URL**
- Debe ser la URL exacta de tu backend en Railway
- Formato: `https://tu-backend-url.railway.app/api`
- Con `/api` al final

---

## 🔄 **Orden de Configuración**

1. **Primero**: Configura las variables del Backend
2. **Segundo**: Obtén las URLs de Railway
3. **Tercero**: Configura CORS_ORIGIN y VITE_API_URL
4. **Cuarto**: Reinicia los servicios

---

## 🎯 **URLs de Railway**

Después del primer despliegue, Railway te dará URLs como:
- **Backend**: `https://tu-proyecto-backend-production.up.railway.app`
- **Frontend**: `https://tu-proyecto-frontend-production.up.railway.app`

**Entonces configuras:**
```bash
CORS_ORIGIN=https://tu-proyecto-frontend-production.up.railway.app
VITE_API_URL=https://tu-proyecto-backend-production.up.railway.app/api
```

---

## 🚨 **Troubleshooting**

### **Error de CORS**
- Verifica que `CORS_ORIGIN` coincida exactamente con tu URL de frontend
- Asegúrate de usar HTTPS

### **Error de Base de Datos**
- Railway configura automáticamente las variables `DATABASE_*`
- No necesitas configurarlas manualmente

### **Error de Build**
- Verifica que todas las variables estén configuradas
- Revisa los logs en Railway Dashboard 