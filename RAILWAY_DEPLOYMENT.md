# 🚂 Despliegue en Railway

## 📋 Requisitos Previos

1. **Cuenta en Railway**: [railway.app](https://railway.app)
2. **Repositorio en GitHub**: Con todos los cambios subidos
3. **Base de datos PostgreSQL**: Se creará automáticamente en Railway

## 🚀 Pasos para Desplegar

### 1. **Conectar Repositorio**

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Conecta tu cuenta de GitHub
5. Selecciona tu repositorio: `fradurgo19/PlataformaInformes`

### 2. **Configurar Servicios**

Railway detectará automáticamente los servicios basándose en `railway.toml`:

#### **Backend Service**
- **Source Directory**: `backend`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

#### **Frontend Service**
- **Source Directory**: `.` (raíz)
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview`

#### **Database Service**
- **Type**: PostgreSQL
- **Plan**: Starter (gratis)

### 3. **Configurar Variables de Entorno**

En Railway Dashboard, ve a **Variables** y configura:

#### **Backend Variables**
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=tu_super_secret_key_produccion_muy_seguro_123456789
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CORS_ORIGIN=https://tu-frontend-url.railway.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **Database Variables** (Railway las proporciona automáticamente)
```bash
DATABASE_HOST=...
DATABASE_PORT=...
DATABASE_NAME=...
DATABASE_USER=...
DATABASE_PASSWORD=...
```

#### **Frontend Variables**
```bash
VITE_API_URL=https://tu-backend-url.railway.app/api
```

### 4. **Configurar Dominios**

1. Ve a **Settings** → **Domains**
2. Railway proporcionará URLs automáticas
3. Opcional: Configura dominio personalizado

### 5. **Inicializar Base de Datos**

1. Ve al servicio de **Backend**
2. Abre la **Console**
3. Ejecuta los comandos de inicialización:

```bash
# Inicializar base de datos
npm run db:init

# Insertar datos de prueba (opcional)
npm run db:seed
```

## 🔧 Configuración de Producción

### **Rate Limiting**
- ✅ Activado en producción
- ✅ 100 requests por 15 minutos
- ✅ 5 intentos de login por 15 minutos

### **Seguridad**
- ✅ CORS configurado para dominio de producción
- ✅ JWT con secret seguro
- ✅ Headers de seguridad activados

### **Archivos**
- ✅ Uploads en directorio persistente
- ✅ Límite de 10MB por archivo

## 📊 Monitoreo

### **Logs**
- Railway proporciona logs en tiempo real
- Accede desde el dashboard de cada servicio

### **Health Checks**
- Backend: `/health`
- Frontend: Automático

### **Métricas**
- Railway proporciona métricas de uso
- Monitoreo de CPU, memoria y red

## 🔄 Despliegue Automático

Railway se conecta automáticamente a GitHub y despliega:
- ✅ En cada push a `main`
- ✅ En cada pull request (opcional)
- ✅ Rollback automático en errores

## 🚨 Troubleshooting

### **Error de Build**
1. Verifica logs en Railway
2. Prueba build localmente: `npm run build`
3. Verifica dependencias en `package.json`

### **Error de Base de Datos**
1. Verifica variables de entorno
2. Ejecuta migraciones: `npm run db:init`
3. Verifica conexión en logs

### **Error de CORS**
1. Verifica `CORS_ORIGIN` en variables
2. Asegúrate de usar HTTPS en producción

## 📞 Soporte

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Discord**: [Railway Discord](https://discord.gg/railway)
- **GitHub Issues**: Para problemas específicos del código

## 🎯 Próximos Pasos

1. **Configurar dominio personalizado**
2. **Configurar SSL automático**
3. **Configurar backups automáticos**
4. **Configurar monitoreo avanzado**
5. **Configurar CI/CD personalizado** 