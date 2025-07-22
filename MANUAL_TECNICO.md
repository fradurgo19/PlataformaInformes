# Manual Técnico – Plataforma Informes

## 1. Estructura del Proyecto

```
project/
│
├── backend/                # Backend (API REST, lógica de negocio)
│   ├── src/
│   │   ├── controllers/    # Controladores de rutas
│   │   ├── middleware/     # Middlewares (auth, validaciones, etc)
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Definición de rutas
│   │   ├── services/       # Servicios (PDF, email, etc)
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   ├── uploads/            # Carpeta para archivos subidos (local/dev)
│   └── config/             # Configuración de base de datos y otros
│
├── src/                    # Frontend (React)
│   ├── components/         # Componentes UI (atoms, molecules, organisms)
│   ├── context/            # Contextos globales (Auth, Reportes, etc)
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Páginas principales
│   ├── services/           # Llamadas a la API
│   ├── types/              # Tipos TypeScript
│   └── utils/              # Utilidades
│
├── api/                    # Endpoints serverless (Vercel)
│
├── .env.example            # Ejemplo de variables de entorno
├── package.json            # Dependencias y scripts
├── README.md               # Documentación general
└── PRODUCCION_SETUP.md     # Guía de despliegue en producción
```

---

## 2. Variables de Entorno

**Backend y Frontend:**

- `SUPABASE_URL` – URL del proyecto Supabase (almacenamiento de imágenes)
- `SUPABASE_ANON_KEY` – Clave pública de Supabase
- `NEON_DATABASE_URL` – Cadena de conexión a la base de datos Neon
- `JWT_SECRET` – Secreto para autenticación JWT (backend)
- `EMAIL_SERVICE_API_KEY` – (opcional) Clave para servicio de email
- Otras variables según integración (ver `.env.example`)

**Gestión:**
- En desarrollo, usar archivos `.env.local`.
- En producción, configurar en el dashboard de Vercel (Project Settings > Environment Variables).

---

## 3. Despliegue

**1. Clonar el repositorio:**
```bash
git clone <url-del-repo>
cd project
```

**2. Instalar dependencias:**
```bash
npm install
```

**3. Configurar variables de entorno:**
- Copiar `.env.example` a `.env.local` y completar los valores.

**4. Desplegar en Vercel:**
- Conectar el repositorio a Vercel.
- Configurar variables de entorno en Vercel.
- Vercel detecta automáticamente el framework y realiza el build.
- El backend se despliega como serverless functions o API routes.
- El frontend se despliega como aplicación estática o SSR.

**5. Configurar Supabase y Neon:**
- Crear proyecto en Supabase y bucket para imágenes.
- Crear base de datos en Neon y ejecutar migraciones.

**6. Verificar funcionamiento:**
- Acceder a la URL de producción proporcionada por Vercel.
- Probar subida de imágenes, generación de reportes, descarga de PDFs, etc. 