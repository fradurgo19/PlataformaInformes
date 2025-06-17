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
```

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

El backend estará disponible en: http://localhost:3001

### Frontend

```bash
# En otra terminal
npm run dev
```

El frontend estará disponible en: http://localhost:5174

## 🔑 Credenciales de Acceso

- **Usuario:** admin
- **Contraseña:** admin123

## 📁 Estructura del Proyecto

```
PlataformaInformes/
├── backend/                 # Servidor Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuración de BD
│   │   ├── controllers/    # Controladores de API
│   │   ├── middleware/     # Middleware de autenticación
│   │   ├── routes/         # Rutas de API
│   │   └── types/          # Tipos TypeScript
│   ├── uploads/            # Archivos subidos
│   └── package.json
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas de la aplicación
│   ├── context/           # Contextos de React
│   ├── services/          # Servicios de API
│   └── types/             # Tipos TypeScript
└── package.json
```

## 🔧 Scripts Disponibles

### Backend
- `npm run build` - Compilar TypeScript
- `npm run start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Reportes
- `GET /api/reports` - Obtener todos los reportes
- `POST /api/reports` - Crear nuevo reporte
- `GET /api/reports/:id` - Obtener reporte específico
- `PUT /api/reports/:id` - Actualizar reporte
- `DELETE /api/reports/:id` - Eliminar reporte

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Frank Duran** - [GitHub](https://github.com/fradurgo19)

---

⭐ Si este proyecto te ayuda, ¡dale una estrella en GitHub! 