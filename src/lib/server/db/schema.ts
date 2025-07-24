import {boolean, date, pgTable, text, timestamp, varchar} from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
	id: text('id').primaryKey(),
	birth: date("birth", {mode: "date"}).notNull(),
	person: text('person').notNull(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	image: boolean('image') // ensure size is compressed to max 500p
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
/*export const template_chatgroup = pgTable("template_chatgroup", {
	id: text('id').primaryKey(),
	content: varchar('content', { length: 1999 }).notNull(),
	image: text('image64'), // an image file encoded base64
	username: text('username').notNull(),
	authorId: text('authorId'),
	sentByGuest: boolean('sentByGuest').default(false).notNull(),
	guestUsername: text('guestUsername'), // the username of the guest who sent this message
	createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).notNull().defaultNow()
})

// requires additional statement to add the fk
export const template_newsgroup = pgTable("group_template", {
	id: text('id').primaryKey(),
	type: text('type').notNull(), // "post" or "reply"
	title: text('title'), // the title of the post
	content: varchar('content', { length: 1999 }).notNull(),
	replyTo: text('replyTo').references(() => template_newsgroup.id, { onDelete: "cascade", onUpdate: "cascade" }), // the ID of the post this is replying to
	image: text('image64'), // an image file encoded base64
	authorId: text('authorId'), // can be null if guest or deleted user
	sentByGuest: boolean('sentByGuest').default(false).notNull(),
	guestUsername: text('guestUsername'), // the username of the guest who sent this message
	createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).notNull().defaultNow()
})*/

export const groupTemplate = pgTable("group_template", {
	id: text('id').primaryKey(),
	type: text('type').notNull(), // news: "post" or "reply", chat: "message"

	title: text('title'), // the title of the post (null for chatgroup)
	content: varchar('content', { length: 1999 }).notNull(),
	replyTo: text('replyTo').references(() => groupTemplate.id), // the ID of the post this is replying to
	image: text('imageId'), // an image file encoded base64

	username: text('username').notNull(), // this way there's an easy way to access simple metadata
	authorId: text('authorId'), // can be null if guest or deleted user
	sentByGuest: boolean('sentByGuest').default(false).notNull(),

	createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	// if the post is being deleted for history's sake it should still be in the DB so replies stay alive.
	deleted: boolean('deleted').default(false).notNull(), // whether the post has been deleted
})

export const groups = pgTable('groups', {
	address: text('address').primaryKey(),
	createdBy: text('created_by').notNull().references(() => user.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	description: text('description').notNull(),
	type: text('type').notNull(), // "chat" or "news"
})

export function groupaddr(address: string) {
	let table = pgTable(`address_${address}`, {
		id: text('id').primaryKey(),
		type: text('type').notNull(), // news: "post" or "reply", chat: "message"

		title: text('title'), // the title of the post (null for chatgroup)
		content: varchar('content', {length: 1999}).notNull(),
		replyTo: text('replyTo').references(() => table.id), // the ID of the post this is replying to
		image: text('imageId'), // an image file encoded base64

		username: text('username').notNull(), // this way there's an easy way to access simple metadata
		authorId: text('authorId'), // can be null if guest or deleted user
		sentByGuest: boolean('sentByGuest').default(false).notNull(),

		createdAt: timestamp('createdAt', {mode: 'date', withTimezone: true}).notNull().defaultNow(),
		// if the post is being deleted for history's sake it should still be in the DB so replies stay alive.
		deleted: boolean('deleted').default(false).notNull(), // whether the post has been deleted
	})
	return table;
}