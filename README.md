# 🏗️ Plataforma de Informes de Maquinaria

Sistema completo para la gestión de reportes técnicos de maquinaria industrial, desarrollado con React + TypeScript (Frontend) y Node.js + Express + PostgreSQL (Backend). Incluye almacenamiento de archivos en Supabase Storage y despliegue en Vercel.

---

## 🚀 Características

- **🔐 Autenticación segura** con JWT
- **📝 Gestión completa de reportes** con formularios dinámicos
- **📸 Subida de imágenes** (Supabase Storage)
- **📊 Dashboard interactivo** con estadísticas
- **💾 Base de datos PostgreSQL** para almacenamiento robusto
- **🎨 Interfaz moderna** con Tailwind CSS
- **📱 Diseño responsive**
- **📄 Generación de PDF** profesional con imágenes incluidas
- **📧 Envío de reportes por email** con PDF adjunto
- **🔄 Múltiples destinatarios** en un solo envío

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT
- Multer
- bcryptjs
- Puppeteer + Chromium serverless
- Nodemailer
- Supabase Storage

---

## 📁 Estructura del Proyecto

```
project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── uploads/
│   ├── package.json
│   └── ...
├── src/ (frontend)
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── utils/
├── api/ (serverless functions para Vercel, si aplica)
├── README.md
├── env.example
└── ...
```

---

## ⚙️ Variables de Entorno

### Frontend (`env.example`):
```env
VITE_API_URL=https://tu-backend-url.com/api
VITE_APP_NAME=Plataforma de Informes de Maquinaria
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
```

### Backend (`backend/env.example`):
```env
PORT=3001
NODE_ENV=production

DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...

JWT_SECRET=...
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

CORS_ORIGIN=https://plataforma-informes.vercel.app

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Supabase Storage
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_BUCKET=uploads
```

---

## 📤 Subida de Imágenes (Supabase Storage)

- Las imágenes de los reportes se suben desde el frontend y se envían al backend como archivos.
- El backend utiliza Supabase Storage para almacenar los archivos en el bucket `uploads`.
- El archivo `backend/src/utils/supabaseStorage.ts` maneja la subida y retorna la URL pública.
- Ejemplo de flujo:
  1. El usuario selecciona imágenes en el formulario de reporte.
  2. El frontend envía las imágenes junto con los datos del reporte al backend.
  3. El backend sube cada imagen a Supabase Storage y guarda la URL pública en la base de datos.
  4. Las URLs públicas se usan para mostrar imágenes en la app y para incrustarlas en los PDFs.

---

## 🖨️ Generación de PDF

- El backend genera PDFs de los reportes usando Puppeteer y Chromium serverless (`@sparticuz/chromium`).
- Las imágenes se insertan en el PDF descargando la URL pública de Supabase y convirtiéndola a base64.
- El endpoint para descargar el PDF es: `GET /api/reports/:id/pdf`
- El PDF incluye:
  - Datos generales del reporte
  - Componentes y hallazgos
  - Fotos de cada componente
  - Partes sugeridas y conclusiones
- El PDF puede ser enviado por email como adjunto usando el endpoint `POST /api/reports/:id/email`.

---

## 🔐 Autenticación

- El sistema usa JWT (JSON Web Tokens) para autenticación y autorización.
- Al iniciar sesión, el backend retorna un token JWT que debe ser guardado en el frontend (usualmente en localStorage o memory).
- Todas las peticiones protegidas (crear, editar, eliminar reportes, ver usuarios, etc.) deben incluir el header:
  ```http
  Authorization: Bearer <token>
  ```
- El backend valida el token en cada endpoint protegido usando un middleware (`authenticateToken`).
- Los roles de usuario (admin, user, viewer) determinan el acceso a ciertos endpoints.
- El token expira según la variable de entorno `JWT_EXPIRES_IN`.

---

## ☁️ Supabase Storage
- Las fotos y archivos se almacenan en Supabase Storage, bucket `uploads`.
- El backend usa las variables `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_BUCKET`.
- Las imágenes se insertan en los PDFs descargando la URL pública y convirtiéndola a base64.

---

## 🚀 Despliegue en Vercel
- El frontend y backend están desplegados en Vercel.
- El backend debe tener todas las dependencias necesarias en su propio `package.json`.
- Las variables de entorno deben configurarse en el dashboard de Vercel para producción.

---

## 🏃‍♂️ Comandos Útiles

### Inicializar base de datos
```bash
cd backend
node init-db.js
```

### Correr en desarrollo
```bash
# Backend
cd backend
npm run dev

# Frontend
cd ..
npm run dev
```

### Build y producción
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd ..
npm run build
npm run preview
```

---

## 🔗 Endpoints Principales

### Autenticación
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`

### Reportes
- `POST /api/reports`
- `GET /api/reports`
- `GET /api/reports/:id`
- `PUT /api/reports/:id`
- `DELETE /api/reports/:id`
- `GET /api/reports/:id/pdf` (descarga PDF con fotos desde Supabase)
- `POST /api/reports/:id/email` (envía PDF por email)
- `POST /api/reports/upload` (subida de archivos)

---

## 🛡️ Seguridad
- JWT para autenticación.
- Contraseñas hasheadas con bcrypt.
- Middleware de seguridad (Helmet, CORS).
- Validación de entrada y rate limiting.

---

## 📝 Notas y Buenas Prácticas
- Mantén las variables de entorno sincronizadas entre Vercel y local.
- Usa siempre URLs públicas de Supabase para imágenes en PDF y frontend.
- Revisa los logs de Vercel para troubleshooting de errores en producción.
- Haz backup regular de la base de datos y del bucket de Supabase.

---

## 📦 Troubleshooting y FAQ

### Problemas comunes:
- **PDF sin imágenes:** Verifica que las URLs de las fotos sean públicas y accesibles desde Supabase.
- **Error 403 en endpoints:** Asegúrate de enviar el token JWT y que el usuario tenga el rol adecuado.
- **Error de Puppeteer/Chromium en Vercel:** Verifica que las dependencias estén en el `package.json` correcto y que uses `@sparticuz/chromium`.

### ¿Preguntas?
Abre un issue en el repositorio o contacta al equipo de desarrollo.

---

## 👨‍💻 Autor y Licencia

Desarrollado por Frank Duran y equipo Partequipos S.A.S

Licencia MIT