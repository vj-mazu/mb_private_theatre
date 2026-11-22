import 'server-only';
import fs from 'fs';
import path from 'path';
import { Pool, PoolClient, types } from 'pg';

// Return DATE columns as plain 'YYYY-MM-DD' strings (no timezone shifting) and counts as numbers.
types.setTypeParser(1082, (v) => v);
types.setTypeParser(20, (v) => Number(v));

const SERVERLESS = !!process.env.VERCEL;

const globalForDb = globalThis as unknown as { mbPool?: Pool; mbSchema?: Promise<void> };

function getPool(): Pool {
  if (!globalForDb.mbPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not configured');
    globalForDb.mbPool = new Pool({
      connectionString: url,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      // Serverless (Vercel) runs many small instances: keep few connections each and use Supabase's pooler URL.
      max: SERVERLESS ? 3 : 10,
      idleTimeoutMillis: SERVERLESS ? 10_000 : 30_000,
    });
  }
  return globalForDb.mbPool;
}

function ensureSchema(): Promise<void> {
  // On Vercel the tables are created once with `npm run db:setup`; skip the check on every cold start.
  if (SERVERLESS) return Promise.resolve();
  if (!globalForDb.mbSchema) {
    const sql = fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf8');
    globalForDb.mbSchema = getPool().query(sql).then(() => undefined).catch((err) => {
      globalForDb.mbSchema = undefined;
      throw err;
    });
  }
  return globalForDb.mbSchema;
}

type Executor = Pick<PoolClient, 'query'>;

export async function q<T = any>(sql: string, params: unknown[] = [], ex?: Executor): Promise<T[]> {
  if (!ex) await ensureSchema();
  const res = await (ex ?? getPool()).query(sql, params as any[]);
  return res.rows as T[];
}

export async function one<T = any>(sql: string, params: unknown[] = [], ex?: Executor): Promise<T | null> {
  const rows = await q<T>(sql, params, ex);
  return rows[0] ?? null;
}

export async function tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function audit(actor: string, action: string, entity: string, entityId: string | number = '', details: unknown = {}) {
  await q('INSERT INTO audit_log (actor, action, entity, entity_id, details) VALUES ($1,$2,$3,$4,$5)', [
    actor, action, entity, String(entityId), JSON.stringify(details ?? {}),
  ]).catch(() => {});
}
