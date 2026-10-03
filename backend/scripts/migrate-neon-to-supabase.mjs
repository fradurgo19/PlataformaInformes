/**
 * Migra datos de Neon (origen) a Supabase Postgres (destino).
 * Preserva UUIDs y rutas de Storage (file_path / video_path).
 *
 * Uso:
 *   SOURCE_DATABASE_URL=... TARGET_DATABASE_URL=... node scripts/migrate-neon-to-supabase.mjs
 *
 * Opcional:
 *   DRY_RUN=1          — solo cuenta filas, no escribe
 *   TRUNCATE_TARGET=1  — vacía tablas destino antes de insertar (recomendado 1ª vez)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');

dotenv.config({ path: path.join(projectRoot, '.env.production.env') });
dotenv.config({ path: path.join(backendRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const SOURCE_URL =
  process.env.SOURCE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  buildUrlFromParts('DB_');

const TARGET_URL =
  process.env.TARGET_DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  buildUrlFromParts('SUPABASE_DB_');

const DRY_RUN = process.env.DRY_RUN === '1';
const TRUNCATE_TARGET = process.env.TRUNCATE_TARGET !== '0';

/** Orden de copia respetando FKs */
const TABLES = [
  'users',
  'machine_types',
  'component_types',
  'resources',
  'parameters',
  'reports',
  'components',
  'photos',
  'videos',
  'suggested_parts',
];

function buildUrlFromParts(prefix) {
  const host = process.env[`${prefix}HOST`];
  const port = process.env[`${prefix}PORT`] || '5432';
  const name = process.env[`${prefix}NAME`];
  const user = process.env[`${prefix}USER`];
  const password = process.env[`${prefix}PASSWORD`];
  if (!host || !name || !user || !password) {
    return null;
  }
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}?sslmode=require`;
}

function maskUrl(url) {
  if (!url) return '(vacío)';
  try {
    const u = new URL(url);
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return '(url inválida)';
  }
}

function createPool(connectionString, label) {
  if (!connectionString) {
    throw new Error(`Falta connection string para ${label}`);
  }
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 3,
    connectionTimeoutMillis: 30000,
  });
}

async function tableExists(client, table) {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  return rows.length > 0;
}

async function getColumns(client, table) {
  const { rows } = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );
  return rows.map((r) => r.column_name);
}

async function countRows(client, table) {
  if (!(await tableExists(client, table))) return null;
  const { rows } = await client.query(`SELECT COUNT(*)::int AS c FROM ${quoteIdent(table)}`);
  return rows[0].c;
}

function quoteIdent(name) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
    throw new Error(`Identificador inválido: ${name}`);
  }
  return `"${name}"`;
}

async function applySchema(target) {
  const schemaPath = path.join(backendRoot, 'supabase', 'schema-complete.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await target.query(sql);
  console.log('✓ Esquema aplicado en destino (schema-complete.sql)');
}

async function copyTable(source, target, table) {
  const sourceExists = await tableExists(source, table);
  if (!sourceExists) {
    console.log(`  · ${table}: no existe en origen — omitida`);
    return { table, copied: 0, skipped: true };
  }

  const targetExists = await tableExists(target, table);
  if (!targetExists) {
    throw new Error(`Tabla ${table} no existe en destino. Aplica schema-complete.sql primero.`);
  }

  const sourceCols = await getColumns(source, table);
  const targetCols = new Set(await getColumns(target, table));
  const columns = sourceCols.filter((c) => targetCols.has(c));

  if (columns.length === 0) {
    throw new Error(`Sin columnas en común para ${table}`);
  }

  const colList = columns.map(quoteIdent).join(', ');
  const { rows } = await source.query(`SELECT ${colList} FROM ${quoteIdent(table)}`);

  if (DRY_RUN) {
    console.log(`  · ${table}: ${rows.length} filas (dry-run)`);
    return { table, copied: rows.length, dryRun: true };
  }

  if (rows.length === 0) {
    console.log(`  · ${table}: 0 filas`);
    return { table, copied: 0 };
  }

  const batchSize = Math.max(1, parseInt(process.env.BATCH_SIZE || '200', 10));
  let copied = 0;

  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize);
    const values = [];
    const valueGroups = [];

    batch.forEach((row, rowIndex) => {
      const placeholders = columns.map((_, colIndex) => {
        values.push(row[columns[colIndex]]);
        return `$${rowIndex * columns.length + colIndex + 1}`;
      });
      valueGroups.push(`(${placeholders.join(', ')})`);
    });

    const insertSql = `INSERT INTO ${quoteIdent(table)} (${colList}) VALUES ${valueGroups.join(', ')} ON CONFLICT DO NOTHING`;
    await target.query(insertSql, values);
    copied += batch.length;
    if (rows.length > batchSize) {
      console.log(`  · ${table}: ${copied}/${rows.length}`);
    }
  }

  console.log(`  · ${table}: ${copied} filas copiadas`);
  return { table, copied };
}

async function truncateTarget(target) {
  const existing = [];
  for (const table of [...TABLES].reverse()) {
    if (await tableExists(target, table)) {
      existing.push(quoteIdent(table));
    }
  }
  if (existing.length === 0) return;
  await target.query(`TRUNCATE TABLE ${existing.join(', ')} RESTART IDENTITY CASCADE`);
  console.log('✓ Destino truncado (TRUNCATE … CASCADE)');
}

async function printCounts(label, client) {
  console.log(`\nConteos ${label}:`);
  for (const table of TABLES) {
    const c = await countRows(client, table);
    console.log(`  ${table.padEnd(18)} ${c === null ? '(n/a)' : c}`);
  }
}

async function sampleMediaUrls(client) {
  const photos = await tableExists(client, 'photos')
    ? await client.query(`SELECT file_path FROM photos WHERE file_path IS NOT NULL LIMIT 3`)
    : { rows: [] };
  const videos = await tableExists(client, 'videos')
    ? await client.query(`SELECT file_path FROM videos WHERE file_path IS NOT NULL LIMIT 3`)
    : { rows: [] };
  return {
    photos: photos.rows.map((r) => r.file_path),
    videos: videos.rows.map((r) => r.file_path),
  };
}

async function main() {
  console.log('=== Migración Neon → Supabase Postgres ===');
  console.log('SOURCE:', maskUrl(SOURCE_URL));
  console.log('TARGET:', maskUrl(TARGET_URL));
  console.log('DRY_RUN:', DRY_RUN);
  console.log('TRUNCATE_TARGET:', TRUNCATE_TARGET && !DRY_RUN);

  if (!SOURCE_URL || !TARGET_URL) {
    console.error(`
Faltan URLs.

Define:
  SOURCE_DATABASE_URL  → connection string de Neon
  TARGET_DATABASE_URL  → connection string de Supabase (Settings → Database)

Ejemplo:
  $env:SOURCE_DATABASE_URL="postgresql://...@....neon.tech/neondb?sslmode=require"
  $env:TARGET_DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres"
  node scripts/migrate-neon-to-supabase.mjs
`);
    process.exit(1);
  }

  if (SOURCE_URL === TARGET_URL) {
    console.error('SOURCE y TARGET son iguales. Abortando.');
    process.exit(1);
  }

  const source = createPool(SOURCE_URL, 'SOURCE');
  const target = createPool(TARGET_URL, 'TARGET');

  try {
    await source.query('SELECT 1');
    await target.query('SELECT 1');
    console.log('✓ Conexiones OK');

    await printCounts('ORIGEN (Neon)', source);

    if (!DRY_RUN) {
      await applySchema(target);
      if (TRUNCATE_TARGET) {
        await truncateTarget(target);
      }
    }

    console.log('\nCopiando tablas…');
    const results = [];
    for (const table of TABLES) {
      results.push(await copyTable(source, target, table));
    }

    await printCounts('DESTINO (Supabase)', target);

    const media = await sampleMediaUrls(target);
    console.log('\nMuestras de media (URLs deben seguir apuntando a Supabase Storage):');
    media.photos.forEach((u) => console.log('  photo:', u));
    media.videos.forEach((u) => console.log('  video:', u));

    const total = results.reduce((s, r) => s + (r.copied || 0), 0);
    console.log(`\n=== Listo. Filas procesadas: ${total}${DRY_RUN ? ' (dry-run)' : ''} ===`);
    console.log(`
Siguiente paso:
  1. En Vercel / .env apunta DB_* o DATABASE_URL al Postgres de Supabase.
  2. Mantén SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY del mismo proyecto Storage.
  3. Verifica login + un informe con fotos/videos.
  4. Cuando confirmes, desactiva o elimina el proyecto Neon.
`);
  } finally {
    await source.end().catch(() => undefined);
    await target.end().catch(() => undefined);
  }
}

main().catch((err) => {
  console.error('Migración falló:', err.message || err);
  process.exit(1);
});
