const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function loadEnv(file) {
  const content = fs.readFileSync(file, 'utf8');
  return content.split(/\r?\n/).reduce((acc, line) => {
    const match = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!match) return acc;
    acc[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
    return acc;
  }, {});
}

const env = loadEnv(path.resolve(__dirname, '../.env.local'));
const url = new URL(env.DATABASE_URL.replace(/\?sslmode=require.*$/, ''));
const pool = new Pool({
  user: url.username,
  password: url.password,
  host: url.hostname,
  port: Number(url.port),
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const result = await pool.query(
    `select table_schema, table_name from information_schema.tables where table_name = $1`,
    ['traceability_logs']
  );
  console.log('Existing tables:', result.rows);

  if (result.rows.length > 0) {
    const count = await pool.query('select count(*) as total from public.traceability_logs');
    console.log('traceability_logs count:', count.rows[0]);

    const cols = await pool.query(
      `select column_name, data_type, is_nullable from information_schema.columns where table_schema='public' and table_name='traceability_logs' order by ordinal_position`
    );
    console.log('Columns:', cols.rows);
  }

  await pool.end();
}

main().catch((error) => {
  console.error('ERROR', error);
  process.exit(1);
});
