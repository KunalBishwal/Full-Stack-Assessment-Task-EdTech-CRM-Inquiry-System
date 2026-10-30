import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { pool, verifyDatabaseConnection } from '../config/database';
import { adminRepository } from '../repositories/admin.repository';

async function provisionAdmin() {
  const cliEmail = process.argv[2];
  const cliPassword = process.argv[3];

  const email = (cliEmail || env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = cliPassword || env.INITIAL_ADMIN_PASSWORD || '';

  if (!email || !email.includes('@')) {
    console.error(
      '❌ Error: Please provide a valid admin email via CLI argument or INITIAL_ADMIN_EMAIL in .env'
    );
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error(
      '❌ Error: Admin password must be at least 8 characters long (pass via CLI or INITIAL_ADMIN_PASSWORD in .env)'
    );
    process.exit(1);
  }

  try {
    await verifyDatabaseConnection();
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    const admin = await adminRepository.upsertAdmin(email, passwordHash);

    console.log('✅ Administrator provisioned successfully:');
    console.log(`   ID:         ${admin.id}`);
    console.log(`   Email:      ${admin.email}`);
    console.log(`   Created At: ${new Date(admin.created_at).toISOString()}`);
  } catch (error) {
    console.error('❌ Failed to provision administrator:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

void provisionAdmin();
