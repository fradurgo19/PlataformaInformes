/**
 * Copia objetos de Storage entre proyectos Supabase y reescribe file_path.
 *
 * Caso típico: bucket en qzaenmrrefulazyneenb → wynihzrohhlflqftgogr
 * sin romper fotos/videos referenciados en Postgres.
 *
 * Uso (PowerShell):
 *   $env:SOURCE_SUPABASE_URL="https://....supabase.co"
 *   $env:SOURCE_SUPABASE_SERVICE_ROLE_KEY="..."
 *   $env:SOURCE_SUPABASE_BUCKET="uploads"
 *   $env:TARGET_SUPABASE_URL="https://wynihzrohhlflqftgogr.supabase.co"
 *   $env:TARGET_SUPABASE_SERVICE_ROLE_KEY="..."
 *   $env:TARGET_SUPABASE_BUCKET="uploads"
 *   $env:TARGET_DATABASE_URL="postgresql://..."   # DB ya migrada o a migrar
 *   $env:DRY_RUN="1"   # opcional
 *   node scripts/migrate-storage-supabase.mjs
 */
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');

dotenv.config({ path: path.join(backendRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env.production.env') });

const DRY_RUN = process.env.DRY_RUN === '1';
const CONCURRENCY = Math.max(1, parseInt(process.env.MIGRATE_CONCURRENCY || '4', 10));

const sourceUrl = process.env.SOURCE_SUPABASE_URL || process.env.SUPABASE_URL;
const sourceKey = process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const sourceBucket = process.env.SOURCE_SUPABASE_BUCKET || process.env.SUPABASE_BUCKET || 'uploads';

const targetUrl = process.env.TARGET_SUPABASE_URL;
const targetKey = process.env.TARGET_SUPABASE_SERVICE_ROLE_KEY;
const targetBucket = process.env.TARGET_SUPABASE_BUCKET || sourceBucket;

const dbUrl =
  process.env.TARGET_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.SOURCE_DATABASE_URL;

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Falta variable ${name}`);
  }
}

function objectPathFromPublicUrl(fileUrl, bucket) {
  if (!fileUrl) return null;
  try {
    const u = new URL(fileUrl);
    const markers = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
      `/object/public/${bucket}/`,
    ];
    for (const marker of markers) {
      const idx = u.pathname.indexOf(marker);
      if (idx >= 0) {
        return decodeURIComponent(u.pathname.slice(idx + marker.length));
      }
    }
    // Fallback: último segmento (nombre de archivo)
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

function rewriteUrl(oldUrl, newBase, bucket) {
  const objectPath = objectPathFromPublicUrl(oldUrl, sourceBucket) || objectPathFromPublicUrl(oldUrl, bucket);
  if (!objectPath) return oldUrl;
  const base = newBase.replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${bucket}/${objectPath}`;
}

async function mapPool(items, limit, worker) {
  const results = [];
  let index = 0;
  async function run() {
    while (index < items.length) {
      const i = index;
      index += 1;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

async function ensureBucket(client, bucket) {
  const { data, error } = await client.storage.listBuckets();
  if (error) throw error;
  const exists = (data || []).some((b) => b.name === bucket);
  if (exists) {
    console.log(`✓ Bucket destinoexiste: ${bucket}`);
    return;
  }
  if (DRY_RUN) {
    console.log(`· DRY_RUN: se crearía bucket ${bucket}`);
    return;
  }
  const { error: createErr } = await client.storage.createBucket(bucket, {
    public: true,
  });
  if (createErr) {
    // Si ya existe o el dashboard lo creó, continuar
    if (!/already exists|duplicate/i.test(createErr.message || '')) {
      throw createErr;
    }
  }
  console.log(`✓ Bucket creado: ${bucket}`);
}

async function copyObject(source, target, objectPath) {
  const { data, error } = await source.storage.from(sourceBucket).download(objectPath);
  if (error) {
    throw new Error(`download ${objectPath}: ${error.message}`);
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  if (DRY_RUN) {
    return { objectPath, bytes: buffer.length, dryRun: true };
  }
  const { error: upErr } = await target.storage.from(targetBucket).upload(objectPath, buffer, {
    upsert: true,
    contentType: data.type || 'application/octet-stream',
  });
  if (upErr) {
    throw new Error(`upload ${objectPath}: ${upErr.message}`);
  }
  return { objectPath, bytes: buffer.length };
}

async function main() {
  console.log('=== Migración Storage Supabase → Supabase ===');
  requireEnv('SOURCE_SUPABASE_URL', sourceUrl);
  requireEnv('SOURCE_SUPABASE_SERVICE_ROLE_KEY', sourceKey);
  requireEnv('TARGET_SUPABASE_URL', targetUrl);
  requireEnv('TARGET_SUPABASE_SERVICE_ROLE_KEY', targetKey);
  requireEnv('TARGET_DATABASE_URL o DATABASE_URL', dbUrl);

  if (sourceUrl === targetUrl) {
    console.log('SOURCE y TARGET Storage son el mismo proyecto — solo reescritura de URLs si aplica.');
  }

  console.log('SOURCE:', sourceUrl, 'bucket:', sourceBucket);
  console.log('TARGET:', targetUrl, 'bucket:', targetBucket);
  console.log('DRY_RUN:', DRY_RUN);

  const source = createClient(sourceUrl, sourceKey);
  const target = createClient(targetUrl, targetKey);
  await ensureBucket(target, targetBucket);

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const photos = await pool.query(
      `SELECT id, file_path FROM photos WHERE file_path IS NOT NULL AND file_path <> ''`
    );
    let videos = { rows: [] };
    try {
      videos = await pool.query(
        `SELECT id, file_path FROM videos WHERE file_path IS NOT NULL AND file_path <> ''`
      );
    } catch {
      console.log('· Tabla videos no existe aún — omitida');
    }

    const entries = [
      ...photos.rows.map((r) => ({ table: 'photos', id: r.id, file_path: r.file_path })),
      ...videos.rows.map((r) => ({ table: 'videos', id: r.id, file_path: r.file_path })),
    ];

    const pathSet = new Map();
    for (const e of entries) {
      const objectPath = objectPathFromPublicUrl(e.file_path, sourceBucket);
      if (objectPath && !pathSet.has(objectPath)) {
        pathSet.set(objectPath, e.file_path);
      }
    }

    console.log(`Filas media: ${entries.length}`);
    console.log(`Objetos únicos a copiar: ${pathSet.size}`);

    const objectPaths = [...pathSet.keys()];
    let ok = 0;
    let fail = 0;
    await mapPool(objectPaths, CONCURRENCY, async (objectPath) => {
      try {
        await copyObject(source, target, objectPath);
        ok += 1;
        if (ok % 25 === 0 || ok === objectPaths.length) {
          console.log(`  copiados ${ok}/${objectPaths.length}`);
        }
      } catch (err) {
        fail += 1;
        console.error(`  ✗ ${objectPath}:`, err.message || err);
      }
    });

    console.log(`Copia Storage: ok=${ok} fail=${fail}`);

    if (!DRY_RUN && sourceUrl !== targetUrl) {
      const photoUpdate = await pool.query(
        `UPDATE photos
         SET file_path = REPLACE(file_path, $1, $2)
         WHERE file_path LIKE $3`,
        [sourceUrl, targetUrl, `${sourceUrl}%`]
      );
      let videoUpdate = { rowCount: 0 };
      try {
        videoUpdate = await pool.query(
          `UPDATE videos
           SET file_path = REPLACE(file_path, $1, $2)
           WHERE file_path LIKE $3`,
          [sourceUrl, targetUrl, `${sourceUrl}%`]
        );
      } catch {
        /* tabla ausente */
      }
      console.log(`✓ URLs reescritas photos=${photoUpdate.rowCount} videos=${videoUpdate.rowCount}`);
    } else if (DRY_RUN) {
      const sample = entries.slice(0, 3).map((e) => ({
        from: e.file_path,
        to: rewriteUrl(e.file_path, targetUrl, targetBucket),
      }));
      console.log('Muestra rewrite (dry-run):', sample);
    }

    console.log('\n=== Storage listo ===');
  } finally {
    await pool.end().catch(() => undefined);
  }
}

main().catch((err) => {
  console.error('Migración Storage falló:', err.message || err);
  process.exit(1);
});
