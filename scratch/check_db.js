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
    const tables = ['farmer_ids', 'podge_identities', 'compliance_evaluations', 'traceability_logs', 'green_sukuk_projects'];
    for (const table of tables) {
      const existsRes = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      const exists = existsRes.rows[0].exists;
      if (!exists) {
        console.log(`Table ${table} does not exist.`);
        continue;
      }
      const countRes = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      const rowsRes = await pool.query(`SELECT * FROM ${table} LIMIT 3`);
      console.log(`\nTable ${table} has ${countRes.rows[0].count} rows:`);
      console.log(rowsRes.rows);
    }
  } catch (error) {
    console.error('ERROR', error);
  } finally {
    await pool.end();
  }
})();
