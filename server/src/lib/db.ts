import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema, type Schema as SchemaType } from './schema';
import { eq, and, or, lt, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Ensure search_path includes user's schema and public so unqualified table names resolve correctly
pool.on('connect', async (client) => {
  try {
    await client.query('SET search_path TO "$user", public');
  } catch (e) {
    // Non-fatal: log to console; logger not initialized here
    // eslint-disable-next-line no-console
    console.warn('[db] Failed to set search_path to public:', (e as Error)?.message);
  }
});

export const db = drizzle(pool, { schema });

export { pool };

export { eq, and, or, lt, sql };
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
export type { SchemaType };
export type User = InferSelectModel<typeof schema.users>;
