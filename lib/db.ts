import { Pool } from 'pg';

// Gunakan POSTGRES_URL (Supabase Pooler / PgBouncer) untuk Vercel serverless
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1, // penting di serverless: batasi koneksi per instance
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});



export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}