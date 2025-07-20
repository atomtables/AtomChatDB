import {encodeBase32LowerCase} from "@oslojs/encoding";
import {fail, redirect} from "@sveltejs/kit";
import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema";
import {eq} from "drizzle-orm";
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
        username.length <= 31
    );
}

export function validateIdentifier(identifier: string, email: boolean) {
    if (email) {
        return (
            typeof identifier === 'string' &&
            identifier.length >= 3 &&
            identifier.length <= 255 &&
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(identifier)
        );
    } else {
        // phone number with country code and must start with +1
        return (
            typeof identifier === 'string' &&
            identifier.length >= 3 &&
            identifier.length <= 31 &&
            identifier.replace(/[^+|0-9]/gm, '').length === 12 &&
            /^\+1\d{10}$/gm.test(identifier.replace(/[^+|0-9]/gm, ''))
        )
    }
}

export function validatePassword(password: string) {
    return (
        typeof password === 'string' &&
        password.length >= 6 &&
        password.length <= 255
    );
}

export function requireLogin() {
    const { locals }: any = getRequestEvent();

    if (!locals.user) {
        return redirect(302, "/demo/lucia/login");
    }

    return locals.user;
}
