import { dbQuery } from '../config/database';
import { AdminRecord } from '../types';

export class AdminRepository {
  async findByEmail(email: string): Promise<AdminRecord | null> {
    const sql = `
      SELECT id, email, password_hash, created_at, last_login_at
      FROM admins
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
    `;
    const result = await dbQuery<AdminRecord>(sql, [email]);
    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<AdminRecord | null> {
    const sql = `
      SELECT id, email, password_hash, created_at, last_login_at
      FROM admins
      WHERE id = $1
      LIMIT 1;
    `;
    const result = await dbQuery<AdminRecord>(sql, [id]);
    return result.rows[0] ?? null;
  }

  async updateLastLogin(id: string): Promise<AdminRecord | null> {
    const sql = `
      UPDATE admins
      SET last_login_at = NOW()
      WHERE id = $1
      RETURNING id, email, password_hash, created_at, last_login_at;
    `;
    const result = await dbQuery<AdminRecord>(sql, [id]);
    return result.rows[0] ?? null;
  }

  async upsertAdmin(email: string, passwordHash: string): Promise<AdminRecord> {
    const sql = `
      INSERT INTO admins (email, password_hash)
      VALUES (LOWER($1), $2)
      ON CONFLICT (email)
      DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id, email, password_hash, created_at, last_login_at;
    `;
    const result = await dbQuery<AdminRecord>(sql, [email.toLowerCase(), passwordHash]);
    return result.rows[0];
  }
}

export const adminRepository = new AdminRepository();
