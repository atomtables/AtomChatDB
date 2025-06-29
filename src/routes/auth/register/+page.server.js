import {fail, redirect} from "@sveltejs/kit";
import {hash} from "@node-rs/argon2";
import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.js";
import * as auth from "$lib/server/auth.js";
import {generateUserId, validatePassword, validateUsername} from "$lib/authclient.js";

export const actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        if (!validateUsername(username)) {
            return fail(400, { message: 'Invalid username' });
        }
        if (!validatePassword(password)) {
            return fail(400, { message: 'Invalid password' });
        }

        const userId = generateUserId();
        const passwordHash = await hash(password, {
            // recommended minimum parameters
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        });

        try {
            await db.insert(table.user).values({ id: userId, username, passwordHash });

            const sessionToken = auth.generateSessionToken();
            const session = await auth.createSession(sessionToken, userId);
            auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
        } catch {
            return fail(500, { message: 'An error has occurred' });
        }
        return redirect(302, '/demo/lucia');
    },
}