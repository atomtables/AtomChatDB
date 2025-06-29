import {encodeBase32LowerCase} from "@oslojs/encoding";
import {fail, redirect} from "@sveltejs/kit";
import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.js";
import {eq} from "drizzle-orm";
import {hash, verify} from "@node-rs/argon2";
import * as auth from "$lib/server/auth.js";
import {getRequestEvent} from "$app/server";

export function generateUserId() {
    // ID with 120 bits of entropy, or about the same as UUID v4.
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id = encodeBase32LowerCase(bytes);
    return id;
}

export function validateUsername(username: string) {
    return (
        typeof username === 'string' &&
        username.length >= 3 &&
        username.length <= 31 &&
        /^[a-z0-9_-]+$/.test(username)
    );
}

export function validatePassword(password: string) {
    return (
        typeof password === 'string' &&
        password.length >= 6 &&
        password.length <= 255
    );
}

export const login = async (username: string, password: string) => {
    if (!validateUsername(username)) {
        return { status: "fail", code: 400, message: 'Invalid username (min 3, max 31 characters, alphanumeric only)' }
    }
    if (!validatePassword(password)) {
        return { status: "fail", code: 400, message: 'Invalid password (min 6, max 255 characters)' }
    }

    const results = await db
        .select()
        .from(table.user)
        .where(eq(table.user.username, username));

    const existingUser = results?.[0];
    if (!existingUser || results.length !== 1) {
        return { status: "fail", code: 400, message: 'Incorrect username or password' }
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
    });
    if (!validPassword) {
        return { status: "fail", code: 400, message: 'Incorrect username or password' }
    }

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, existingUser.id);
    return { status: "success", sessionToken, session };
    // auth.setSessionTokenCookiee(event, sessionToken, session.expiresAt);
    //
    // return redirect(302, '/demo/lucia');
}

export const register = async (username: string, password: string) => {
    if (!validateUsername(username)) {
        return { status: "fail", code: 400, message: 'Invalid username (min 3, max 31 characters, alphanumeric only)' }
    }
    if (!validatePassword(password)) {
        return { status: "fail", code: 400, message: 'Invalid password (min 6, max 255 characters)' }
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
        return { status: "success", sessionToken, session };
        // auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
    } catch {}
    return { status: "fail", code: 500, message: 'An error has occurred' }
}

export function requireLogin() {
    const { locals }: any = getRequestEvent();

    if (!locals.user) {
        return redirect(302, "/demo/lucia/login");
    }

    return locals.user;
}
