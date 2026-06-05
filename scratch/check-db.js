const { query } = require('../lib/db');
query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
  .then(r => { 
    console.log("TABLES_LIST:", JSON.stringify(r.rows)); 
    process.exit(0); 
  })
  .catch(e => { 
    console.error("DB_ERROR:", e); 
    process.exit(1); 
  });
