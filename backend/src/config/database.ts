import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Prefer DATABASE_URL (Supabase / Neon connection string).
 * Fallback to discrete DB_* vars for local development.
 */
function buildPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL?.trim();
  const isProduction = process.env.NODE_ENV === 'production';
  const ssl =
    isProduction || process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined;

  if (connectionString) {
    return {
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl,
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'machinery_reports',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: isProduction ? 10000 : 2000,
    ssl,
  };
}

const pool = new Pool(buildPoolConfig());

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
