# 🚀 Guía de Despliegue - Plataforma de Informes de Maquinaria

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL 12+
- Git

## 🔧 Configuración Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/fradurgo19/PlataformaInformes.git
cd PlataformaInformes
```

### 2. Configurar Base de Datos
```sql
CREATE DATABASE maquinaria_reports;
CREATE USER maquinaria_user WITH PASSWORD 'maquinaria_password';
GRANT ALL PRIVILEGES ON DATABASE maquinaria_reports TO maquinaria_user;
```

### 3. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Inicializar Base de Datos
```bash
node init-db.js
```

### 5. Configurar Frontend
```bash
cd ..
npm install
cp .env.example .env
# Editar .env con la URL de tu API
```

### 6. Ejecutar en Desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🌐 Despliegue en Producción

### Opción A: Vercel + Railway

#### Frontend (Vercel)
```bash
npm install -g vercel
vercel --prod
```

#### Backend (Railway)
1. Conectar repositorio a Railway
2. Configurar variables de entorno
3. Desplegar automáticamente

### Opción B: VPS (DigitalOcean/AWS)

#### Configurar Servidor
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Instalar PM2
npm install -g pm2
```

#### Desplegar Backend
```bash
cd backend
npm install
npm run build
pm2 start dist/index.js --name "machinery-backend"
pm2 save
pm2 startup
```

#### Desplegar Frontend
```bash
npm install
npm run build
# Subir carpeta dist a tu servidor web
```

## 🔐 Variables de Entorno

### Frontend (.env)
```env
VITE_API_URL=https://tu-backend-url.com/api
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
DB_HOST=tu-host-postgresql
DB_PORT=5432
DB_NAME=maquinaria_reports
DB_USER=tu-usuario
DB_PASSWORD=tu-password
JWT_SECRET=tu-super-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://tu-frontend-url.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

## 📊 Monitoreo

### PM2 (Backend)
```bash
pm2 monit
pm2 logs
pm2 status
```

### Logs
```bash
pm2 logs machinery-backend
```

## 🔄 Actualizaciones

### Backend
```bash
git pull
cd backend
npm install
npm run build
pm2 restart machinery-backend
```

### Frontend
```bash
git pull
npm install
npm run build
# Subir nueva versión
```

## 🆘 Solución de Problemas

### Error de Base de Datos
```bash
# Verificar conexión
psql -h tu-host -U tu-usuario -d maquinaria_reports

# Recrear base de datos
node reset-db.js
```

### Error de CORS
- Verificar CORS_ORIGIN en backend
- Asegurar que coincida con tu dominio frontend

### Error de JWT
- Verificar JWT_SECRET
- Asegurar que sea el mismo en todas las instancias

## 📞 Soporte

Para problemas técnicos, crear un issue en el repositorio de GitHub. 