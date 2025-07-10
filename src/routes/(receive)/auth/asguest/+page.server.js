import {fail, redirect} from "@sveltejs/kit";
import {hash} from "@node-rs/argon2";
import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.ts";
import * as auth from "$lib/server/auth.js";
import {generateUserId, validateIdentifier, validatePassword, validateUsername} from "$lib/authclient.ts";
import {generateSessionToken} from "$lib/server/auth.js";

export const actions = {
    default: async (event) => {
        console.log(event.getClientAddress())
        const formData = await event.request.formData();
        const username = formData.get('username');

        if (!validateUsername(username)) {
            return fail(400, { message: 'Please enter a valid username (min 3 chars max 31 chars)' });
        }

        try {
            const sessionToken = "guest_" + generateSessionToken();
            const session = await auth.createGuestSession(username, sessionToken, event.getClientAddress());
            auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
        } catch (e) {
            console.log(e);
            return fail(500, { message: 'An error has occurred' });
        }
        return redirect(302, '/');
    },
}