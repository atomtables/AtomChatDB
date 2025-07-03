import * as auth from '$lib/server/auth';

const handleAuth = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

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

	users.isGuest = sessionToken.startsWith("guest_");
	event.locals.user = users;
	event.locals.session = sessions;
	return resolve(event);
};

export const handle = handleAuth;
