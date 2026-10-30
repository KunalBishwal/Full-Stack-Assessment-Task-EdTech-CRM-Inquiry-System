import fs from 'fs';
import path from 'path';
import { pool, verifyDatabaseConnection } from '../config/database';

async function runMigration() {
  console.log('🔄 Verifying Supabase PostgreSQL connection...');
  await verifyDatabaseConnection();
  console.log('✅ Connected to database.');

  const candidatePaths = [
    path.resolve(__dirname, '../../../database/schema.sql'),
    path.resolve(process.cwd(), '../database/schema.sql'),
    path.resolve(process.cwd(), 'database/schema.sql'),
  ];

  let schemaSql = '';
  let resolvedPath = '';

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      schemaSql = fs.readFileSync(p, 'utf-8');
      resolvedPath = p;
      break;
    }
  }

  if (!schemaSql) {
    throw new Error(`schema.sql not found in candidate paths: ${candidatePaths.join(', ')}`);
  }

  console.log(`📄 Applying schema from: ${resolvedPath}`);
  await pool.query(schemaSql);
  console.log('✅ Database schema applied successfully!');

  // Verify created tables
  const { rows } = await pool.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
  );
  console.log('📋 Public tables in database:', rows.map((r) => r.table_name));
}

runMigration()
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
