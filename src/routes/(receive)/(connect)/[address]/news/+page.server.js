import {db} from "$lib/server/db/index.js";
import {asc, desc, eq} from "drizzle-orm";
import * as auth from "$lib/server/auth.js";
import {invalidateGuestSession, invalidateSession, validateSessionToken} from "$lib/server/auth.js";
import {error, fail} from "@sveltejs/kit";
import * as table from "$lib/server/db/schema.ts";
import {analytics} from "$lib/server/stores.svelte.ts";
import {groupaddr} from "$lib/server/db/schema.ts";

export const load = async ({ locals, params, fetch }) => {
    if (!locals.user || !locals.session) {
        return error(401, { message: 'Unauthorized' });
    }

    if ((await db.select().from(table.groups).where(eq(table.groups.address, params.address)))?.[0]?.type !== 'news') {
        return error(404, { message: 'This address does not exist or is not a news group.' });
    }

    analytics[params.address] = analytics[params.address] || new Set();
    analytics[params.address].add(locals.user.id);

    return {
        data: (await (await fetch(`/${params.address}/news/post`, { method: 'GET' })).json()).posts
    }
};

const permissionCheck = async (event) => {
    // noinspection DuplicatedCode
    if (!event.locals.session) return fail(401, { message: 'Unauthorized' });
    if (!event.locals.user) return fail(401, { message: 'Unauthorized' });

    if (!event.locals.user.isGuest) {
        const session = await validateSessionToken(event.cookies.get(auth.sessionCookieName));
        if (session.session.id !== event.locals.session.id) {
            try { await invalidateSession(event.locals.session.id); } catch {}
            try { await invalidateGuestSession(event.locals.session.id); } catch {}
            return fail(403, { message: "Invalid session token. Reload and log back in." });
        }
    }
}

export const actions = {
    createPost: async (event) => {
        await permissionCheck(event);

        const formData = await event.request.formData();

        let content = await event.fetch(`/${event.params.address}/news/post`, {
            method: 'POST',
            body: formData,
            duplex: 'half'
        });

        return {status: 200, data: (await content.json()).post};
    },
    replyPost: async (event) => {
        await permissionCheck(event);
        const formData = await event.request.formData();

        const response = await event.fetch(`/${event.params.address}/news/replies`, {
            method: 'POST',
            body: formData,
            duplex: 'half'
        });

        return await response.json();
    }
}