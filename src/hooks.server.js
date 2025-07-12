import * as auth from '$lib/server/auth';
import * as fs from "node:fs";


export const handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	const ipAddress = event.getClientAddress();

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

	// if loading a DP from /public/dp and dp does not exist, get DP from a https://api.dicebear.com/5.x/initials/jpg?seed={data.user.username}
	if (event.url.pathname.startsWith('/public/dp/') && !fs.existsSync(`static/${event.url.pathname}`)) {
		const dpUrl = `https://api.dicebear.com/5.x/initials/jpg?seed=${event.url.pathname.split('/')[2]}`;
		return await fetch(dpUrl)
	}

	return resolve(event);
};

export const init = () => {
	fs.mkdirSync("static/public/dp", { recursive: true });
	fs.mkdirSync("static/public/images", { recursive: true });
}