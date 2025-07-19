import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import {env} from '$env/dynamic/private';
import {lt, sql} from "drizzle-orm";
import {boolean, pgTable, text, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
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

export function groupaddr(address) {
    let table = pgTable(`address_${address}`, {
        id: text('id').primaryKey(),
        type: text('type').notNull(), // news: "post" or "reply", chat: "message"

        title: text('title'), // the title of the post (null for chatgroup)
        content: varchar('content', { length: 1999 }).notNull(),
        replyTo: text('replyTo').references(() => table.id), // the ID of the post this is replying to
        image: text('imageId'), // an image file encoded base64

        username: text('username').notNull(), // this way there's an easy way to access simple metadata
        authorId: text('authorId'), // can be null if guest or deleted user
        sentByGuest: boolean('sentByGuest').default(false).notNull(),

        createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
        // if the post is being deleted for history's sake it should still be in the DB so replies stay alive.
        deleted: boolean('deleted').default(false).notNull(), // whether the post has been deleted
    })
    return table;
}