import {db, groupaddr} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.ts";
import {eq} from "drizzle-orm";
import {fail, redirect} from "@sveltejs/kit";
import {invalidateGuestSession, invalidateSession, validateSessionToken} from "$lib/server/auth.js";

export const actions = {
    createProposal: async (event) => {
        if (!event.locals.session) return fail(401, { message: 'Unauthorized' });
        if (!event.locals.user) return fail(401, { message: 'Unauthorized' });

        const formData = await event.request.formData();
        const description = formData.get('description');
        const whyShould = formData.get('whyShould');
        const type = formData.get('type');

        const sendFormData = new FormData();
        sendFormData.append("title", event.params.address)
        sendFormData.append('content',  `+${type}=\n++Description+ ${description} end==\n+++Reason+ ${whyShould} end===`);

        await event.fetch(`/news.groups.proposals/news/post`, {
            method: 'POST',
            body: sendFormData,
        });
    }
}