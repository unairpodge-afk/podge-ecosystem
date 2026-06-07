import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const dbUrl = new URL(databaseUrl.replace(/\?sslmode=require.*$/, ''));

const pool = new Pool({
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname,
  port: Number(dbUrl.port),
  database: dbUrl.pathname.slice(1),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}