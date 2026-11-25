import 'server-only';
import fs from 'fs';
import path from 'path';
import { Pool, types, type PoolClient } from 'pg';

// Return DATE columns as plain 'YYYY-MM-DD' strings (no timezone shifting) and counts as numbers.
types.setTypeParser(1082, (v) => v);
types.setTypeParser(20, (v) => Number(v));

const SERVERLESS = !!process.env.VERCEL;

const globalForDb = globalThis as unknown as { mbPool?: Pool; mbSchema?: Promise<void> };

function getPool(): Pool {
  if (!globalForDb.mbPool) {
    // Tolerate common paste mistakes: surrounding spaces/quotes.
    let url = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '');
    if (!url) throw new Error('DATABASE_URL is not configured');
    // Hosted databases (Supabase etc.) need SSL. An `sslmode=` in the URL would override the setting below and
    // make node-postgres reject the provider's certificate chain, so SSL is configured here instead.
    const useSsl = /^(true|1|yes)$/i.test((process.env.DATABASE_SSL || '').trim()) || /supabase\.(co|com)/i.test(url);
    if (useSsl) url = url.replace(/([?&])sslmode=[^&]*&?/i, '$1').replace(/[?&]$/, '');
    globalForDb.mbPool = new Pool({
      connectionString: url,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10_000,
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
