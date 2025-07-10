import * as auth from '$lib/server/auth';

const handleAuth = async ({ event, resolve }) => {
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
	return resolve(event);
};

export const handle = handleAuth;
