# Machinery Reports Backend

Backend API para la plataforma de reportes de maquinaria construido con Node.js, Express, TypeScript y PostgreSQL.

## Características

- 🔐 Autenticación JWT
- 📊 Base de datos PostgreSQL
- 📁 Subida de archivos con Multer
- 🛡️ Middleware de seguridad (Helmet, CORS)
- 📝 Logging con Morgan
- 🔄 Transacciones de base de datos
- 📱 API RESTful

## Requisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

## Instalación

1. **Clonar el repositorio**
   ```bash
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   PORT=3001
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=machinery_reports
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key_here
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Configurar PostgreSQL**
   - Crear la base de datos:
     ```sql
     CREATE DATABASE machinery_reports;
     ```
   - Ejecutar el esquema:
     ```bash
     psql -d machinery_reports -f src/config/schema.sql
     ```

## Scripts

- **Desarrollo**: `npm run dev`
- **Compilar**: `npm run build`
- **Producción**: `npm start`

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── schema.sql
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── reportController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── upload.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   └── reports.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── uploads/
├── package.json
└── tsconfig.json
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Reportes
- `POST /api/reports` - Crear reporte
- `GET /api/reports` - Listar reportes
- `GET /api/reports/:id` - Obtener reporte por ID
- `PUT /api/reports/:id` - Actualizar reporte
- `DELETE /api/reports/:id` - Eliminar reporte
- `POST /api/reports/upload` - Subir archivos

### Health Check
- `GET /health` - Verificar estado del servidor

## Base de Datos

### Tablas Principales

1. **users** - Usuarios del sistema
2. **reports** - Reportes de inspección
3. **components** - Componentes evaluados
4. **photos** - Fotos de componentes
5. **suggested_parts** - Partes sugeridas

### Relaciones

- Un usuario puede tener muchos reportes
- Un reporte puede tener muchos componentes
- Un componente puede tener muchas fotos
- Un reporte puede tener muchas partes sugeridas

## Seguridad

- Autenticación JWT
- Contraseñas hasheadas con bcrypt
- Middleware de seguridad con Helmet
- CORS configurado
- Validación de entrada
- Transacciones de base de datos

## Desarrollo

Para ejecutar en modo desarrollo:

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`

## Producción

Para compilar y ejecutar en producción:

```bash
npm run build
npm start
```

## Usuario por Defecto

El esquema incluye un usuario administrador por defecto:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@machinery.com 