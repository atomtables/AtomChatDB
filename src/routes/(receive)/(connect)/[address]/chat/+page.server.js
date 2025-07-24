import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.js";
import {eq} from "drizzle-orm";
import {error} from "@sveltejs/kit";
import {analytics} from "$lib/server/stores.svelte.ts";
import { dev } from '$app/environment';
import {env} from "$env/dynamic/private";

export const load = async ({ locals, params, fetch }) => {
    if (!locals.user || !locals.session) {
        return error(401, { message: 'Unauthorized' });
    }

    if ((await db.select().from(table.groups).where(eq(table.groups.address, params.address)))?.[0]?.type !== 'chat') {
        return error(404, { message: 'This address does not exist or is not a chat group.' });
    }

    analytics[params.address] = analytics[params.address] || new Set();
    analytics[params.address].add(locals.user.id);

    return {
        socket: dev ? `/${params.address}/chat/connect` : `wss://${env.socket}/${params.address}/chat/connect`
    }
}