import {pgTable, serial, integer, text, timestamp, date, customType, varchar, boolean} from 'drizzle-orm/pg-core';
import {encodeBase64NoPadding} from "@oslojs/encoding";
import {relations} from "drizzle-orm";

export const user = pgTable('users', {
	id: text('id').primaryKey(),
	birth: date("birth", {mode: "date"}).notNull(),
	person: text('person').notNull(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

/*
	Guest accounts do not have a user id, they instead rely on a session ID.
	Guest accounts do not have the ability to be authenticated without a password.
	Before logging into a chatroom and during pings, a client must specify their
	username, session ID, and authentication status. If these do not match up,
	users can be kicked easily.
 */
export const guest = pgTable("guests", {
	id: text('id').primaryKey(), // session id
	ipAddr: text('ipAddr').notNull().unique(),
	username: text("username").notNull().unique(),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
})

export const session = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// CREATE TABLE new_table (LIKE template_group INCLUDING ALL);
export const template_chatgroup = pgTable("template_chatgroup", {
	id: text('id').primaryKey(),
	content: varchar('content', { length: 1999 }).notNull(),
	image: text('image64'), // an image file encoded base64
	username: text('username').notNull(),
	authorId: text('authorId'),
	sentByGuest: boolean('sentByGuest').default(false).notNull(),
	createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).notNull().defaultNow()
})

// requires additional statement to add the fk
export const template_newsgroup = pgTable("template_newsgroup", {
	id: text('id').primaryKey(),
	type: text('type').notNull(), // "post" or "reply"
	title: text('title'), // the title of the post
	content: varchar('content', { length: 1999 }).notNull(),
	replyTo: text('replyTo').references(() => template_newsgroup.id, { onDelete: "cascade", onUpdate: "cascade" }), // the ID of the post this is replying to
	image: text('image64'), // an image file encoded base64
	username: text('username').notNull(),
	authorId: text('authorId'),
	sentByGuest: boolean('sentByGuest').default(false).notNull(),
	createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).notNull().defaultNow()
})

export const groups = pgTable('groups', {
	address: text('address').primaryKey(),
	createdBy: text('created_by').notNull().references(() => user.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	description: text('description').notNull(),
	type: text('type').notNull(), // "chat" or "news"
})