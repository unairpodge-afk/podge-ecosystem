(async () => {
  const { Pool } = await import('pg');
  const fs = await import('node:fs/promises');
  const env = (await fs.readFile('.env.local', 'utf8'))
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const m = line.match(/^POSTGRES_URL=(.*)$/);
      if (m) acc.POSTGRES_URL = m[1].replace(/^"|"$/g, '');
      return acc;
    }, {});
  const pool = new Pool({ connectionString: env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });

  try {
    const res = await pool.query('SELECT 1 AS ok');
    console.log('CONNECTED', res.rows);
  } catch (error) {
    console.error('ERROR', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
})();
