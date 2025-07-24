import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import {env} from '$env/dynamic/private';
import {lt, sql} from "drizzle-orm";
import {analytics} from "$lib/server/stores.svelte.ts";

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

setInterval(() => {
    db.delete(schema.session)
        .where(lt(schema.session.expiresAt, sql`NOW()`))
    db.delete(schema.guest)
        .where(lt(schema.guest.expiresAt, sql`NOW()`))
}, 5000000)

setInterval(() => {
    Object.keys(analytics).forEach((address) => {
        analytics[address] = new Set();
    })
}, 86400000)

