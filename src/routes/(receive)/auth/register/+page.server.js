import {fail, redirect} from "@sveltejs/kit";
import {hash} from "@node-rs/argon2";
import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.ts";
import * as auth from "$lib/server/auth.js";
import {generateUserId, validateIdentifier, validatePassword, validateUsername} from "$lib/authclient.ts";

export const actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const email = formData.get('email') === 'e-mail';
        const personalIdentifier = formData.get('personalIdentifier')
        const birth = new Date(formData.get('birth'))
        const username = formData.get('username');
        const password = formData.get('password');

        if (!validateIdentifier(personalIdentifier, email)) {
            if (email) {
                return fail(400, { message: 'Please enter a valid email.'})
            } else {
                return fail(400, { message: 'Invalid phone number. Only USA numbers are currently supported.'})
            }
        }
        if (!validateUsername(username)) {
            return fail(400, { message: 'Please enter a valid username (min 3 chars max 31 chars)' });
        }
        if (!validatePassword(password)) {
            return fail(400, { message: 'Please enter a valid password (min 6 chars max 255 chars)' });
        }
        if (!birth || isNaN(birth.getTime())) {
            return fail(400, { message: 'Please enter a valid date of birth' })
        }
        const old = new Date();
        old.setFullYear(old.getFullYear() - 13);
        if (birth > old) {
            return fail(400, { message: 'You are too young to use this service. Please grow up.'})
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
            await db.insert(table.user).values({ id: userId, username, passwordHash, birth, person: personalIdentifier });

            const sessionToken = auth.generateSessionToken();
            const session = await auth.createSession(sessionToken, userId);
            auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
        } catch (e) {
            console.log(e);
            return fail(500, { message: 'An error has occurred' });
        }
        return redirect(302, '/');
    },
}