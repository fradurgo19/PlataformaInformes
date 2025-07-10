# 🚀 Despliegue en Vercel + Supabase

## 📋 Requisitos Previos

1. **Cuenta en Vercel**: [vercel.com](https://vercel.com)
2. **Cuenta en Supabase**: [supabase.com](https://supabase.com)
3. **Repositorio en GitHub**: Con todos los cambios subidos

## 🗄️ Paso 1: Configurar Supabase

### **1.1 Crear Proyecto en Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Guarda las credenciales de conexión

### **1.2 Configurar Base de Datos**
1. Ve a **SQL Editor** en Supabase
2. Ejecuta el script de inicialización:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    machine_type VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    hourmeter INTEGER NOT NULL,
    report_date DATE NOT NULL,
    ott VARCHAR(255),
    conclusions TEXT,
    overall_suggestions TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Components table
CREATE TABLE IF NOT EXISTS components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    findings TEXT NOT NULL,
    parameters TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('CORRECTED', 'PENDING')),
    suggestions TEXT,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suggested parts table
CREATE TABLE IF NOT EXISTS suggested_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    part_number VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Machine Types table
CREATE TABLE IF NOT EXISTS machine_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Component Types table
CREATE TABLE IF NOT EXISTS component_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_components_report_id ON components(report_id);
CREATE INDEX IF NOT EXISTS idx_photos_component_id ON photos(component_id);
CREATE INDEX IF NOT EXISTS idx_suggested_parts_report_id ON suggested_parts(report_id);

-- Insert default admin user
INSERT INTO users (username, email, password_hash, full_name, role) 
VALUES ('admin', 'admin@machinery.com', '$2a$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;
```

### **1.3 Obtener Variables de Supabase**
1. Ve a **Settings** → **Database**
2. Copia las credenciales:
   - **Database URL**
   - **Database Password**
   - **Host**
   - **Port**
   - **Database Name**

## 🌐 Paso 2: Configurar Vercel

### **2.1 Conectar Repositorio**
1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta
3. Haz clic en **"New Project"**
4. Conecta tu cuenta de GitHub
5. Selecciona tu repositorio: `fradurgo19/PlataformaInformes`

### **2.2 Configurar Variables de Entorno**
En Vercel Dashboard, ve a **Settings** → **Environment Variables** y agrega:

```bash
# Database Configuration (Supabase)
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_supabase
DATABASE_URL=postgresql://postgres:tu_password_supabase@db.xxxxxxxxxxxx.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=3ebe615b5ae3ce3f0df232998e2e531ca879bf3928daea6601efa3336285de92
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=https://tu-proyecto.vercel.app

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend API URL
VITE_API_URL=https://tu-proyecto.vercel.app/api
```

### **2.3 Configurar Build Settings**
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🔧 Paso 3: Configurar Backend para Vercel

### **3.1 Modificar Backend para Serverless**
El backend necesita algunos ajustes para funcionar en Vercel Functions.

### **3.2 Configurar CORS**
Asegúrate de que CORS esté configurado para tu dominio de Vercel.

## 🚀 Paso 4: Desplegar

### **4.1 Desplegar en Vercel**
1. Haz push de todos los cambios a GitHub
2. Vercel detectará automáticamente los cambios
3. El despliegue comenzará automáticamente

### **4.2 Verificar Despliegue**
1. Ve a tu dashboard de Vercel
2. Verifica que el build sea exitoso
3. Prueba la aplicación en la URL proporcionada

## 📊 Monitoreo

### **Vercel Analytics**
- Vercel proporciona analytics gratuitos
- Monitoreo de rendimiento
- Logs en tiempo real

### **Supabase Dashboard**
- Monitoreo de base de datos
- Logs de consultas
- Métricas de uso

## 🚨 Troubleshooting

### **Error de Base de Datos**
1. Verifica las variables de entorno de Supabase
2. Asegúrate de que la base de datos esté inicializada
3. Verifica la conectividad desde Vercel

### **Error de CORS**
1. Verifica que `CORS_ORIGIN` coincida con tu dominio de Vercel
2. Asegúrate de usar HTTPS

### **Error de Build**
1. Verifica los logs en Vercel
2. Prueba el build localmente
3. Verifica las dependencias

## 🎯 Próximos Pasos

1. **Configurar dominio personalizado**
2. **Configurar SSL automático**
3. **Configurar backups automáticos**
4. **Configurar monitoreo avanzado** 