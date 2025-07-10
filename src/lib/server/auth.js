import {eq} from 'drizzle-orm';
import {sha256} from '@oslojs/crypto/sha2';
import {encodeBase64url, encodeHexLowerCase} from '@oslojs/encoding';
import {db} from '$lib/server/db';
import * as table from '$lib/server/db/schema.js';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	return encodeBase64url(bytes);
}

/**
 * @param {string} token
 * @param {string} userId
 */
export async function createSession(token, userId) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function createGuestSession(username, token, ip) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const guestSession = {
		id: sessionId,
		ipAddr: ip,
		username,
		expiresAt: new Date(Date.now() + DAY_IN_MS)
	}
	await db.insert(table.guest).values(guestSession)
	return guestSession;
}

/** @param {string} token
 *  @param hashed
 */
export async function validateSessionToken(token, hashed = false) {
	let sessionId;
	if (!hashed)
		sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	else sessionId = token;
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: table.user,
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;
	user.passwordHash = undefined;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	let puser = {
		id: user.id,
		username: user.username,
		birth: new Date(),
		person: user.person || null, // Assuming 'person' is a field in the user table
		image: user.image || null, // Assuming 'image' is a field in the user table
		isGuest: false
	}

	return { session, user: puser };
}

export async function validateGuestSessionToken(token, hashed = false) {
	let sessionId;
	if (!hashed)
		sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	else sessionId = token;
	const [result] = await db
		.select()
		.from(table.guest)
		.where(eq(table.guest.id, sessionId));

	if (!result) { return { session: null, user: null }; }
	const user = result;
	const sessionExpired = Date.now() >= user.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.guest).where(eq(table.guest.id, sessionId));
		return { session: null, user: null };
	}

	const pSession = {
		id: sessionId,
		userId: null,
		expiresAt: user.expiresAt
	}
	const pUser = {
		id: sessionId,
		username: user.username,
		birth: new Date(),
		person: user.ipAddr,
		isGuest: true,
		image: null
	}

	return { session: pSession, user: pUser };
}

/** @param {string} sessionId */
export async function invalidateSession(sessionId) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export async function invalidateGuestSession(sessionId) {
	await db.delete(table.guest).where(eq(table.guest.id, sessionId));
}

/**
 * @param {import("@sveltejs/kit").RequestEvent} event
 * @param {string} token
 * @param {Date} expiresAt
 */
export function setSessionTokenCookie(event, token, expiresAt) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

/** @param {import("@sveltejs/kit").RequestEvent} event */
export function deleteSessionTokenCookie(event) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
