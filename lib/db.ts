import { Pool, type QueryResult, type QueryResultRow } from 'pg';

function getPostgresUrl() {
  const postgresUrl = process.env.POSTGRES_URL;

  if (!postgresUrl) {
    return postgresUrl;
  }

  const parsedUrl = new URL(postgresUrl);

  // node-postgres lets SSL params in the URL override the `ssl` object below.
  // Supabase pooler URLs often include sslmode, which can re-enable strict CA
  // verification and trigger SELF_SIGNED_CERT_IN_CHAIN in Vercel/Node.
  ['sslmode', 'sslcert', 'sslkey', 'sslrootcert'].forEach((param) => {
    parsedUrl.searchParams.delete(param);
  });

  return parsedUrl.toString();
}

// Gunakan POSTGRES_URL (Supabase Pooler / PgBouncer) untuk Vercel serverless
const pool = new Pool({
  connectionString: getPostgresUrl(),
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1, // penting di serverless: batasi koneksi per instance
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});



export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('Query failed', { text, duration, error });
    throw error;
  }
}
