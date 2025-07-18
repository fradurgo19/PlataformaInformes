<!-- Deploy: optimización manualChunks en vite.config.ts -->
# 🏗️ Plataforma de Informes de Maquinaria

Sistema completo para la gestión de reportes técnicos de maquinaria industrial, desarrollado con React + TypeScript (Frontend) y Node.js + Express + PostgreSQL (Backend).

## 🚀 Características

- **🔐 Autenticación segura** con JWT
- **📝 Gestión completa de reportes** con formularios dinámicos
- **📸 Subida de imágenes** para documentación visual
- **📊 Dashboard interactivo** con estadísticas
- **💾 Base de datos PostgreSQL** para almacenamiento robusto
- **🎨 Interfaz moderna** con Tailwind CSS
- **📱 Diseño responsive** para todos los dispositivos
- **📄 Generación de PDF** profesional con imágenes incluidas
- **📧 Envío de reportes por email** con PDF adjunto
- **🔄 Múltiples destinatarios** en un solo envío

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Axios** para peticiones HTTP

### Backend
- **Node.js** con Express
- **TypeScript** para type safety
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **Multer** para manejo de archivos
- **bcryptjs** para encriptación
- **Puppeteer** para generación de PDF
- **Nodemailer** para envío de emails

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **PostgreSQL** (versión 12 o superior)
- **npm** o **yarn**

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/fradurgo19/PlataformaInformes.git
cd PlataformaInformes
```

### 2. Configurar Base de Datos PostgreSQL

```sql
-- Conectar como superusuario
CREATE DATABASE maquinaria_reports;
CREATE USER maquinaria_user WITH PASSWORD 'maquinaria_password';
GRANT ALL PRIVILEGES ON DATABASE maquinaria_reports TO maquinaria_user;
```

### 3. Aplicar el esquema de base de datos

```bash
# Usando psql (ajusta la ruta según tu instalación)
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U maquinaria_user -d maquinaria_reports -f backend/src/config/schema.sql
```

### 4. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend/`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maquinaria_reports
DB_USER=maquinaria_user
DB_PASSWORD=maquinaria_password

# JWT Configuration
JWT_SECRET=supersecretkey123456789
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:5174

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Nota:** Para Gmail, necesitas usar una "Contraseña de aplicación" en lugar de tu contraseña normal.

### 5. Configurar Frontend

```bash
cd ..
npm install
```

### 6. Inicializar la base de datos

```bash
cd backend
node init-db.js
```

## 🏃‍♂️ Ejecutar el Proyecto

### Backend

```bash
cd backend
npm run build
npm run start
```