import {fail, redirect} from "@sveltejs/kit";
import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.ts";
import {eq} from "drizzle-orm";
import {verify} from "@node-rs/argon2";
import * as auth from "$lib/server/auth.js";
import {validateIdentifier, validatePassword, validateUsername} from "$lib/authclient.js";

export const actions = {
    default: async (event) => {
        if (event.locals.user) return redirect(302, '/');

        const formData = await event.request.formData();
        const email = formData.get('email') === 'e-mail';
        const username = formData.get('personalIdentifier');
        const password = formData.get('password');

        if (!validateIdentifier(username, email)) {
            return fail(400, { message: `Invalid ${email ? 'e-mail' : 'phone number'}` });
        }
        if (!validatePassword(password)) {
            return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
        }

        const results = await db
            .select()
            .from(table.user)
            .where(eq(table.user.person, username));

        const existingUser = results?.[0];
        if (!existingUser) {
            console.debug("wrong email")
            return fail(400, { message: 'Invalid credentials' });
        }

        const validPassword = await verify(existingUser.passwordHash, password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        });
        if (!validPassword) {
            console.debug("wrong password")
            return fail(400, { message: 'Invalid credentials' });
        }

        const sessionToken = auth.generateSessionToken();
        const session = await auth.createSession(sessionToken, existingUser.id);
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

        return redirect(302, '/');
    },
}