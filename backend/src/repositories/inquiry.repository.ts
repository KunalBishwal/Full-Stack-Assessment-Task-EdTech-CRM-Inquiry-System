import { dbQuery } from '../config/database';
import {
  InquiryListQuery,
  InquiryRecord,
  InquiryStatus,
  InquirySummaryCounts,
  PaginatedInquiriesResult,
} from '../types';
import { CreateInquiryInput } from '../validators/inquiry.validator';

export class InquiryRepository {
  async create(input: CreateInquiryInput): Promise<InquiryRecord> {
    const sql = `
      INSERT INTO inquiries (name, email, phone, user_type, category, message, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'New')
      RETURNING id, name, email, phone, user_type, category, message, status, created_at, updated_at;
    `;
    const params = [
      input.name,
      input.email,
      input.phone,
      input.user_type,
      input.category,
      input.message,
    ];
    const result = await dbQuery<InquiryRecord>(sql, params);
    return result.rows[0];
  }

  async findById(id: string): Promise<InquiryRecord | null> {
    const sql = `
      SELECT id, name, email, phone, user_type, category, message, status, created_at, updated_at
      FROM inquiries
      WHERE id = $1
      LIMIT 1;
    `;
    const result = await dbQuery<InquiryRecord>(sql, [id]);
    return result.rows[0] ?? null;
  }

  async updateStatus(id: string, status: InquiryStatus): Promise<InquiryRecord | null> {
    const sql = `
      UPDATE inquiries
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, phone, user_type, category, message, status, created_at, updated_at;
    `;
    const result = await dbQuery<InquiryRecord>(sql, [status, id]);
    return result.rows[0] ?? null;
  }

  async listPaginated(query: InquiryListQuery): Promise<PaginatedInquiriesResult> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (query.search) {
      params.push(`%${query.search}%`);
      const idx = params.length;
      conditions.push(`(name ILIKE $${idx} OR phone ILIKE $${idx})`);
    }

    if (query.category) {
      params.push(query.category);
      conditions.push(`category = $${params.length}`);
    }

    if (query.user_type) {
      params.push(query.user_type);
      conditions.push(`user_type = $${params.length}`);
    }

    if (query.status) {
      params.push(query.status);
      conditions.push(`status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM inquiries
      ${whereClause};
    `;
    const countResult = await dbQuery<{ total: number }>(countSql, params);
    const total = countResult.rows[0]?.total ?? 0;

    const offset = (query.page - 1) * query.limit;
    const dataParams = [...params, query.limit, offset];
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;

    const dataSql = `
      SELECT id, name, email, phone, user_type, category, message, status, created_at, updated_at
      FROM inquiries
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;
    const dataResult = await dbQuery<InquiryRecord>(dataSql, dataParams);

    const summarySql = `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'New')::int AS new_count,
        COUNT(*) FILTER (WHERE status = 'Contacted')::int AS contacted_count,
        COUNT(*) FILTER (WHERE status = 'In Progress')::int AS in_progress_count,
        COUNT(*) FILTER (WHERE status = 'Resolved')::int AS resolved_count
      FROM inquiries;
    `;
    const summaryResult = await dbQuery<InquirySummaryCounts>(summarySql);
    const summary = summaryResult.rows[0] ?? {
      total: 0,
      new_count: 0,
      contacted_count: 0,
      in_progress_count: 0,
      resolved_count: 0,
    };

    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return {
      items: dataResult.rows,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
      summary,
    };
  }
}

export const inquiryRepository = new InquiryRepository();
