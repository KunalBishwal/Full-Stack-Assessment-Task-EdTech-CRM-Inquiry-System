import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

const isSslEnabled =
  env.DATABASE_SSL ||
  env.NODE_ENV === 'production' ||
  env.DATABASE_URL.includes('supabase.com') ||
  env.DATABASE_URL.includes('sslmode=require');

// Strip sslmode from URL query string so pg-connection-string doesn't override rejectUnauthorized
const cleanConnectionString = env.DATABASE_URL.replace(/([?&])sslmode=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');

export const pool = new Pool({
  connectionString: cleanConnectionString,
  ssl: isSslEnabled ? { rejectUnauthorized: false } : false,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL idle client error:', err);
});

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function verifyDatabaseConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}
