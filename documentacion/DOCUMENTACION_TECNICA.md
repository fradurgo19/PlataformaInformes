# Documentación Técnica - Plataforma de Informes de Maquinaria

## 📋 Descripción General

La Plataforma de Informes de Maquinaria es un sistema web completo diseñado para gestionar reportes técnicos de maquinaria industrial. Permite a los usuarios crear, visualizar, editar y descargar informes detallados sobre inspecciones de equipos, incluyendo fotografías, parámetros técnicos y recomendaciones.

El sistema está construido con una arquitectura moderna separando el frontend (interfaz de usuario) del backend (servidor y base de datos), lo que permite escalabilidad y mantenimiento sencillo.

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

El proyecto está dividido en tres partes principales:

1. **Frontend (Cliente)**: Interfaz web construida con React y TypeScript
2. **Backend (Servidor)**: API REST construida con Node.js y Express
3. **Base de Datos**: PostgreSQL para almacenar toda la información
4. **Almacenamiento de Archivos**: Supabase Storage para guardar imágenes

### Flujo de Datos

```
Usuario → Frontend (React) → Backend API (Express) → Base de Datos (PostgreSQL)
                                              ↓
                                    Supabase Storage (Imágenes)
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend

- **React 18**: Biblioteca de JavaScript para construir interfaces de usuario
- **TypeScript**: Lenguaje que añade tipos a JavaScript para mayor seguridad
- **Vite**: Herramienta de construcción rápida para desarrollo
- **Tailwind CSS**: Framework de estilos para diseño moderno y responsive
- **React Router**: Manejo de navegación entre páginas
- **Axios**: Cliente HTTP para comunicarse con el backend
- **React Query**: Gestión de estado del servidor y caché de datos

### Backend

- **Node.js**: Entorno de ejecución de JavaScript en el servidor
- **Express**: Framework web para crear la API REST
- **TypeScript**: Mismo lenguaje tipado usado en el frontend
- **PostgreSQL**: Base de datos relacional robusta
- **JWT (JSON Web Tokens)**: Sistema de autenticación seguro
- **bcryptjs**: Encriptación de contraseñas
- **Multer**: Manejo de subida de archivos
- **Puppeteer**: Generación de PDFs desde HTML
- **Nodemailer**: Envío de correos electrónicos

### Infraestructura

- **Vercel**: Plataforma de despliegue para frontend y backend
- **Neon**: Base de datos PostgreSQL en la nube
- **Supabase**: Almacenamiento de archivos en la nube

---

## 📁 Estructura del Proyecto

### Frontend (`/src`)

```
src/
├── components/          # Componentes reutilizables de la interfaz
│   ├── atoms/          # Componentes básicos (botones, inputs)
│   ├── molecules/     # Componentes compuestos (formularios)
│   ├── organisms/     # Componentes complejos (tablas, listas)
│   └── templates/     # Plantillas de páginas (layouts)
├── pages/             # Páginas principales de la aplicación
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ReportsPage.tsx
│   ├── NewReportPage.tsx
│   └── ...
├── context/           # Estado global de la aplicación
│   ├── AuthContext.tsx    # Autenticación del usuario
│   ├── ReportContext.tsx  # Estado de los reportes
│   └── TypesContext.tsx   # Tipos de máquinas y componentes
├── services/          # Servicios para comunicarse con el backend
│   └── api.ts
├── hooks/            # Funciones reutilizables (custom hooks)
├── types/            # Definiciones de tipos TypeScript
└── utils/            # Utilidades y funciones auxiliares
```

### Backend (`/backend/src`)

```
backend/src/
├── config/           # Configuraciones (base de datos, etc.)
│   └── database.ts
├── controllers/      # Lógica de negocio de cada funcionalidad
│   ├── authController.ts
│   ├── reportController.ts
│   └── ...
├── routes/          # Definición de rutas de la API
│   ├── auth.ts
│   ├── reports.ts
│   └── ...
├── middleware/      # Funciones intermedias (autenticación, validación)
│   ├── auth.ts
│   ├── upload.ts
│   └── ...
├── models/          # Modelos de datos y consultas a la base de datos
├── services/        # Servicios especializados (PDF, email)
│   ├── pdfService.ts
│   └── emailService.ts
├── utils/           # Utilidades del servidor
└── types/           # Tipos TypeScript del backend
```

---

## 🔐 Sistema de Autenticación

### Cómo Funciona

El sistema utiliza **JWT (JSON Web Tokens)** para autenticación. Este es un método seguro y moderno que funciona así:

1. El usuario ingresa su nombre de usuario y contraseña
2. El backend verifica las credenciales en la base de datos
3. Si son correctas, genera un token JWT que contiene información del usuario
4. El frontend guarda este token y lo envía en cada petición
5. El backend valida el token antes de permitir acceso a recursos protegidos

### Roles de Usuario

El sistema tiene tres tipos de usuarios:

- **Admin**: Acceso completo, puede gestionar usuarios y todos los reportes
- **User**: Puede crear y ver todos los reportes
- **Viewer**: Solo puede ver sus propios reportes

### Seguridad de Contraseñas

Las contraseñas nunca se guardan en texto plano. Se encriptan usando **bcryptjs**, un algoritmo de hash seguro que convierte la contraseña en un código irreversible.

---

## 📊 Base de Datos

### Tablas Principales

La base de datos PostgreSQL contiene las siguientes tablas principales:

1. **users**: Información de los usuarios del sistema
   - id, username, email, password_hash, role, full_name

2. **reports**: Reportes de inspección de maquinaria
   - id, client_name, machine_type, model, serial_number, date, created_by

3. **components**: Componentes inspeccionados en cada reporte
   - id, report_id, component_type_id, findings, observations

4. **component_photos**: Fotos asociadas a componentes
   - id, component_id, photo_url, photo_name

5. **parameters**: Parámetros técnicos medidos
   - id, component_id, parameter_name, value, unit, limit_range

6. **machine_types**: Tipos de máquinas disponibles
   - id, name, name_en (nombre en inglés)

7. **component_types**: Tipos de componentes
   - id, name, name_en, machine_type_id

### Relaciones

- Un usuario puede crear muchos reportes
- Un reporte tiene muchos componentes
- Un componente tiene muchas fotos y parámetros
- Los tipos de componentes pertenecen a tipos de máquinas

---

## 📤 Gestión de Archivos (Imágenes)

### Almacenamiento en Supabase

Las imágenes de los reportes se almacenan en **Supabase Storage**, un servicio de almacenamiento en la nube. Esto permite:

- Acceso rápido a las imágenes desde cualquier lugar
- URLs públicas para mostrar imágenes en la aplicación
- Escalabilidad sin preocuparse por espacio en el servidor

### Flujo de Subida

1. El usuario selecciona imágenes en el formulario del reporte
2. El frontend envía las imágenes al backend
3. El backend sube cada imagen a Supabase Storage
4. Se guarda la URL pública en la base de datos
5. Las imágenes se muestran usando estas URLs

---

## 📄 Generación de PDFs

### Proceso de Generación

Los PDFs se generan usando **Puppeteer**, una herramienta que controla un navegador para convertir HTML en PDF. El proceso es:

1. El backend recibe la solicitud de generar PDF de un reporte
2. Obtiene todos los datos del reporte de la base de datos
3. Descarga las imágenes desde Supabase Storage
4. Crea un documento HTML con todos los datos e imágenes
5. Usa Puppeteer para convertir el HTML en PDF
6. Devuelve el PDF al usuario para descarga

### Contenido del PDF

Cada PDF incluye:
- Información general del reporte (cliente, máquina, fecha)
- Lista de componentes inspeccionados
- Hallazgos y observaciones de cada componente
- Fotos de los componentes
- Parámetros técnicos medidos
- Conclusiones y sugerencias generales

---

## 📧 Sistema de Envío de Emails

### Funcionalidad

El sistema puede enviar reportes por correo electrónico con el PDF adjunto. Utiliza **Nodemailer** para conectarse a un servidor SMTP (como Gmail).

### Configuración

Se requiere configurar:
- Servidor SMTP (ej: smtp.gmail.com)
- Puerto (generalmente 587)
- Usuario y contraseña de la cuenta de email
- Destinatarios del reporte

---

## 🔌 API REST - Endpoints Principales

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario
- `GET /api/auth/profile` - Obtener perfil del usuario actual

### Reportes

- `GET /api/reports` - Listar todos los reportes (con filtros opcionales)
- `GET /api/reports/:id` - Obtener un reporte específico
- `POST /api/reports` - Crear un nuevo reporte
- `PUT /api/reports/:id` - Actualizar un reporte existente
- `DELETE /api/reports/:id` - Eliminar un reporte (solo admin)
- `GET /api/reports/:id/pdf` - Descargar PDF del reporte
- `POST /api/reports/:id/email` - Enviar reporte por email

### Tipos de Máquinas y Componentes

- `GET /api/machine-types` - Listar tipos de máquinas
- `GET /api/component-types` - Listar tipos de componentes
- `POST /api/machine-types` - Crear tipo de máquina (admin)
- `POST /api/component-types` - Crear tipo de componente (admin)

### Usuarios (Solo Admin)

- `GET /api/users` - Listar todos los usuarios
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

---

## ⚙️ Variables de Entorno

### Frontend

Las variables de entorno del frontend deben comenzar con `VITE_`:

```env
VITE_API_URL=https://tu-backend-url.com/api
VITE_APP_NAME=Plataforma de Informes de Maquinaria
```

### Backend

El backend requiere más variables de entorno:

```env
# Servidor
PORT=3001
NODE_ENV=production

# Base de Datos
DB_HOST=tu-host-postgresql
DB_PORT=5432
DB_NAME=nombre_base_datos
DB_USER=usuario_db
DB_PASSWORD=contraseña_db

# Autenticación
JWT_SECRET=clave_secreta_muy_larga_y_aleatoria
JWT_EXPIRES_IN=7d

# CORS (origen permitido)
CORS_ORIGIN=https://plataforma-informes.vercel.app

# Supabase Storage
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=clave_de_servicio
SUPABASE_BUCKET=uploads

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=contraseña_de_aplicacion
```

---

## 🚀 Despliegue

### Vercel

El proyecto está desplegado en **Vercel**, que permite:

- Despliegue automático desde Git
- Funciones serverless para el backend
- CDN global para el frontend
- Configuración de variables de entorno desde el dashboard

### Proceso de Despliegue

1. Los cambios se suben a Git (GitHub, GitLab, etc.)
2. Vercel detecta los cambios automáticamente
3. Construye el proyecto (compila TypeScript, optimiza assets)
4. Despliega en producción
5. La aplicación queda disponible en la URL configurada

---

## 🛡️ Seguridad

### Medidas Implementadas

1. **Autenticación JWT**: Tokens seguros con expiración
2. **Encriptación de contraseñas**: bcryptjs con salt
3. **HTTPS**: Todas las comunicaciones encriptadas
4. **CORS**: Control de orígenes permitidos
5. **Helmet**: Headers de seguridad HTTP
6. **Rate Limiting**: Límite de peticiones por tiempo
7. **Validación de entrada**: Sanitización de datos del usuario
8. **Roles y permisos**: Control de acceso basado en roles

---

## 📝 Flujo de Trabajo Típico

### Crear un Reporte

1. Usuario inicia sesión en la plataforma
2. Navega a "Nuevo Reporte"
3. Completa información general (cliente, máquina, fecha)
4. Agrega componentes inspeccionados
5. Para cada componente:
   - Sube fotos
   - Agrega hallazgos y observaciones
   - Registra parámetros técnicos medidos
6. Agrega conclusiones y sugerencias generales
7. Guarda el reporte
8. El sistema guarda todo en la base de datos y las imágenes en Supabase

### Ver y Descargar Reporte

1. Usuario navega a "Reportes"
2. Ve lista de reportes con filtros y búsqueda
3. Selecciona un reporte para ver detalles
4. Puede descargar el PDF haciendo clic en "Descargar PDF"
5. El backend genera el PDF con todas las imágenes y datos
6. El PDF se descarga en el navegador del usuario

---

## 🔧 Desarrollo Local

### Requisitos Previos

- Node.js (versión 18 o superior)
- PostgreSQL (o acceso a una base de datos remota)
- Cuenta de Supabase (para almacenamiento de imágenes)

### Pasos para Configurar

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   cd backend && npm install
   ```
3. Configurar variables de entorno (copiar `.env.example` a `.env`)
4. Inicializar base de datos:
   ```bash
   cd backend
   node init-db.js
   ```
5. Iniciar backend:
   ```bash
   cd backend
   npm run dev
   ```
6. Iniciar frontend (en otra terminal):
   ```bash
   npm run dev
   ```

---

## 🐛 Solución de Problemas Comunes

### PDF sin imágenes

- Verificar que las URLs de Supabase sean públicas
- Revisar que las imágenes existan en Supabase Storage
- Verificar permisos del bucket en Supabase

### Error de autenticación

- Verificar que el token JWT esté siendo enviado en los headers
- Comprobar que el token no haya expirado
- Revisar la variable `JWT_SECRET` en el backend

### Error de conexión a base de datos

- Verificar variables de entorno de la base de datos
- Comprobar que la base de datos esté accesible
- En producción, verificar configuración SSL

### Imágenes no se suben

- Verificar configuración de Supabase (URL, clave, bucket)
- Revisar límites de tamaño de archivo
- Comprobar permisos del bucket en Supabase

---

## 📚 Recursos Adicionales

- **Documentación de React**: https://react.dev
- **Documentación de Express**: https://expressjs.com
- **Documentación de PostgreSQL**: https://www.postgresql.org/docs
- **Documentación de Supabase**: https://supabase.com/docs
- **Documentación de Vercel**: https://vercel.com/docs

---

## 👥 Mantenimiento y Soporte

### Logs y Monitoreo

El sistema incluye:
- Logs de errores en archivos (`backend/logs/error.log`)
- Logs de auditoría (`backend/logs/audit.log`)
- Métricas de uso accesibles en `/metrics`

### Backup

Es importante realizar backups regulares de:
- Base de datos PostgreSQL
- Bucket de Supabase Storage
- Variables de entorno

---

## 📞 Contacto

Para preguntas técnicas o soporte, contactar al equipo de desarrollo.

---

*Última actualización: Noviembre 2024*

