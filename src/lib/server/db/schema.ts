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
export const template_group = pgTable("template_group", {
	id: serial('id').primaryKey(),
	content: varchar('content', { length: 1999 }).notNull(),
	image: text('image64'), // an image file encoded base64
	username: text('username').notNull(),
	authorId: text('authorId'),
	sentByGuest: boolean('sentByGuest').default(false).notNull(),
})

export const domain = pgTable("domains", {
	domain: text('domain').primaryKey(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	createdBy: text('created_by').notNull().references(() => user.id),
	description: text('description')
})

export const domainRelation = relations(domain, ({ many }) => ({
	classes: many(class_)
}))

export const class_ = pgTable("classes", {
	class: text('name').primaryKey(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	createdBy: text('created_by').notNull().references(() => user.id),
	description: text('description'),
	domain: text('domain').notNull(),
})

export const classRelation = relations(class_, ({ one, many }) => ({
	domain: one(domain, {
		fields: [class_.domain],
		references: [domain.domain]
	}),
	focuses: many(focus)
}))

export const focus = pgTable("focus", {
	focus: text('name').primaryKey(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	createdBy: text('created_by').notNull().references(() => user.id),
	description: text('description'),
	domain: text('domain').notNull().references(() => domain.domain),
	class: text('class').notNull()
})

export const focusRelation = relations(focus, ({ one, many }) => ({
	classes: one(class_, {
		fields: [focus.class],
		references: [class_.class]
	}),
	topics: many(topic)
}))

export const topic = pgTable("topics", {
	topic: text('name').primaryKey(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	createdBy: text('created_by').notNull().references(() => user.id),
	description: text('description'),
	domain: text('domain').notNull().references(() => domain.domain),
	class: text('class').notNull().references(() => class_.class),
	focus: text('focus').notNull()
})

export const topicRelation = relations(topic, ({ one }) => ({
	focus: one(focus, {
		fields: [topic.focus],
		references: [focus.focus]
	})
}))