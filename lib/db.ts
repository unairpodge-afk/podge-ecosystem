import { Pool } from 'pg';

// Supabase Postgres pooler may present a TLS certificate chain that Node
// rejects in some environments. Disable cert verification here so the app can
// reliably connect to the Supabase database.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function getEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

const connectionString =
  getEnv('POSTGRES_URL') ??
  getEnv('DATABASE_URL') ??
  getEnv('POSTGRES_URL_NON_POOLING');

if (!connectionString) {
  throw new Error(
    'Database connection string is missing. Set POSTGRES_URL, DATABASE_URL, or POSTGRES_URL_NON_POOLING in .env.local.'
  );
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1, // penting di serverless: batasi koneksi per instance
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});



export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('Query failed', { text, duration, error });
    throw error;
  }
}