# Migración Neon → Supabase (Postgres + Storage)

Proyecto destino: `https://wynihzrohhlflqftgogr.supabase.co`

## Situación actual

| Capa | Hoy | Destino |
|------|-----|---------|
| Postgres | Neon `machinery-reports-db` (~38 MB) | Supabase Postgres del proyecto nuevo |
| Storage | Proyecto **otro**: `qzaenmrrefulazyneenb` (bucket `uploads`) | Mismo proyecto nuevo `wynihzrohhlflqftgogr` |

Las fotos/videos **no** están en Neon: Neon solo guarda metadatos y `file_path` (URL pública de Storage). Hay que migrar **DB + objetos Storage** y reescribir URLs.

---

## Prerrequisitos (Dashboard Supabase destino)

1. Password de la base: **Settings → Database**.
2. Connection string (Session pooler `6543` o Direct `5432`).
3. `service_role` key: **Settings → API**.
4. Bucket público `uploads` (el script de Storage puede crearlo).

---

## Paso A — Migrar Postgres (Neon → Supabase)

Desde `backend/`:

```powershell
cd backend
npm install

$env:SOURCE_DATABASE_URL = "<connection string Neon>"
$env:TARGET_DATABASE_URL = "postgresql://postgres.wynihzrohhlflqftgogr:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

# Simulación
$env:DRY_RUN = "1"
npm run db:migrate:supabase

# Real
Remove-Item Env:DRY_RUN -ErrorAction SilentlyContinue
$env:TRUNCATE_TARGET = "1"
npm run db:migrate:supabase
```

El script aplica `supabase/schema-complete.sql` y copia tablas en orden FK preservando UUIDs y `file_path`.

---

## Paso B — Migrar Storage (proyecto viejo → nuevo)

Usa las keys del Storage **origen** (las actuales en `backend/.env` / Vercel) y las del proyecto **destino**.

```powershell
$env:SOURCE_SUPABASE_URL = "https://qzaenmrrefulazyneenb.supabase.co"
$env:SOURCE_SUPABASE_SERVICE_ROLE_KEY = "<service_role origen>"
$env:SOURCE_SUPABASE_BUCKET = "uploads"

$env:TARGET_SUPABASE_URL = "https://wynihzrohhlflqftgogr.supabase.co"
$env:TARGET_SUPABASE_SERVICE_ROLE_KEY = "<service_role destino>"
$env:TARGET_SUPABASE_BUCKET = "uploads"

# Apunta a la DB YA migrada en Supabase
$env:TARGET_DATABASE_URL = "postgresql://postgres.wynihzrohhlflqftgogr:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

$env:DRY_RUN = "1"
npm run db:migrate:storage

Remove-Item Env:DRY_RUN -ErrorAction SilentlyContinue
npm run db:migrate:storage
```

El script descarga cada objeto referenciado en `photos`/`videos`, lo sube al bucket destino y hace `REPLACE` del host en `file_path`.

---

## Paso C — Cortar producción (Vercel)

```text
DATABASE_URL=postgresql://postgres.wynihzrohhlflqftgogr:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres

SUPABASE_URL=https://wynihzrohhlflqftgogr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role destino>
SUPABASE_BUCKET=uploads
```

El backend prioriza `DATABASE_URL` (`src/config/database.ts`). Redeploy tras guardar env.

Plantilla: `backend/env.supabase.example`.

---

## Verificación

- Login con usuario existente
- Conteos de informes ≈ Neon
- Fotos y videos abren (URL con host `wynihzrohhlflqftgogr`)
- Crear informe + foto + video nuevo
- Admin: usuarios / recursos / parámetros

Cuando esté estable: pausar/eliminar Neon y el proyecto Storage antiguo.

---

## Notas

- No uses el `schema.sql` viejo con seed de admin (pisa datos).
- Rota passwords/keys si estuvieron en archivos locales.
- Sin secretos en código (SonarQube).
