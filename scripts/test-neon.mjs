import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT now() as now, current_database() as db`;
console.log('Connected:', rows);
const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
console.log('Tables:', tables.map(t=>t.table_name));
for (const t of ['settings','kk','umat','peristiwa']) {
  const c = await sql.query(`SELECT count(*)::int AS n FROM ${t}`);
  console.log(t, 'rows:', c[0].n);
}
