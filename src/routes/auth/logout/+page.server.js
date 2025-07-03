import * as auth from '$lib/server/auth';
import {error, fail, redirect} from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import {requireLogin} from "$lib/authclient.js";

export const load = async () => {
    const user = requireLogin()
    return { user };
};

export const actions = {
    default: async (event) => {
        const sessionToken = event.cookies.get(auth.sessionCookieName);
        if (!event.locals.session) {
            return error(401);
        }
        if (event.locals.session.id)
        if (sessionToken.startsWith('guest_')) {
            await auth.invalidateGuestSession(event.locals.session.id);
        } else {
            await auth.invalidateSession(event.locals.session.id);
        }
        auth.deleteSessionTokenCookie(event);

        return redirect(302, '/');
    },
};
