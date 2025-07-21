import * as auth from '$lib/server/auth';
import * as fs from "node:fs";
import {db} from "$lib/server/db/index.js";
import {type RequestEvent} from "@sveltejs/kit";

export const handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	const ipAddress = event.getClientAddress();

	event.setHeaders({
		"Access-Control-Allow-Origin": "https://chat.atomtables.dev",
		"Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
	})

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	let sessions, users;
	if (sessionToken.startsWith("guest_")) {
		let {session, user} = await auth.validateGuestSessionToken(sessionToken);
		sessions = session
		users = user
		if (users.person !== ipAddress) {
			// If the IP address has changed, invalidate the session
			try { await auth.invalidateGuestSession(sessionToken); } catch {}
			sessions = null;
			users = null;
		}
	} else {
		let {session, user} = await auth.validateSessionToken(sessionToken);
		sessions = session
		users = user
	}

	if (sessions) {
		auth.setSessionTokenCookie(event, sessionToken, sessions.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	if (users) users.isGuest = sessionToken.startsWith("guest_");

	event.locals.user = users;
	event.locals.session = sessions;

	return resolve(event);
};

export const init = async () => {
	fs.mkdirSync("public/dp", { recursive: true });
	fs.mkdirSync("public/images", { recursive: true });

	try { await db.execute(`insert into groups values ('news.groups.proposals', 'internalsystem', '1970-01-01', 'The place to insert new proposals to create new groups. It is recommended that you use the "request creation" dialogue to submit a request. You can view and reply to other proposals, seeing which ones were rejected and accepted.', 'news') on conflict do nothing`); } catch (e) { console.log("existing group:", e.message) }
	try { await db.execute(`CREATE TABLE IF NOT EXISTS "address_news.groups.proposals" (LIKE "group_template" INCLUDING ALL)`) } catch (e) { console.log(e.message); }
	try { await db.execute(`ALTER TABLE "address_news.groups.proposals" ADD CONSTRAINT "news.groups.proposals_replyTo_news.groups.proposals_id_fk" FOREIGN KEY ("replyTo") REFERENCES "public"."address_news.groups.proposals"("id") ON DELETE no action ON UPDATE no action`) } catch (e) { console.log(e.message); }
	try { await db.execute(`insert into users values ('internalsystem', '1970-01-01', 'computer', 'AtomChatDB Internal System', '', false)`) } catch (e) { console.log("existing user:", e.message); }
}