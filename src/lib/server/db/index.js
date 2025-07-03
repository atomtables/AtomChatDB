import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { env } from '$env/dynamic/private';
import {sql} from "drizzle-orm";

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

setInterval(() => {
    db.delete(schema.session)
        .where(schema.session.expiresAt.lt(sql`NOW()`))
    db.delete(schema.guest)
        .where(schema.guest.expiresAt.lt(sql`NOW()`))
}, 5000000)