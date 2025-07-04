import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import {env} from '$env/dynamic/private';
import {lt, sql} from "drizzle-orm";
import {boolean, pgTable, text, timestamp, varchar} from "drizzle-orm/pg-core";

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

setInterval(() => {
    db.delete(schema.session)
        .where(lt(schema.session.expiresAt, sql`NOW()`))
    db.delete(schema.guest)
        .where(lt(schema.guest.expiresAt, sql`NOW()`))
}, 5000000)

export function newsgroupAddress(address) {
    let table = pgTable(`address_${address}`, {
        id: text('id').primaryKey(),
        type: text('type').notNull(), // "post" or "reply"
        title: text('title'), // the title of the post
        content: varchar('content', { length: 1999 }).notNull(),
        replyTo: text('replyTo').references(() => table.id), // the ID of the post this is replying to
        image: text('image64'), // an image file encoded base64
        username: text('username').notNull(),
        authorId: text('authorId'),
        sentByGuest: boolean('sentByGuest').default(false).notNull(),
        createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).notNull().defaultNow()
    })
    return table;
}

export function chatroomAddress(address) {
    return pgTable(`address_${address}`, {
        id: text('id').primaryKey(),
        content: varchar('content', {length: 1999}).notNull(),
        image: text('image64'), // an image file encoded base64
        username: text('username').notNull(),
        authorId: text('authorId'),
        sentByGuest: boolean('sentByGuest').default(false).notNull(),
        createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).notNull().defaultNow()
    });
}