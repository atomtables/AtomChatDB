import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import {requireLogin} from "$lib/authclient.js";

export const load = async () => {
    const user = requireLogin()
    return { user };
};

export const actions = {
    default: async (event) => {
        if (!event.locals.session) {
            return fail(401);
        }
        await auth.invalidateSession(event.locals.session.id);
        auth.deleteSessionTokenCookie(event);

        return redirect(302, '/demo/lucia/login');
    },
};
