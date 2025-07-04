import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.js";
import {eq} from "drizzle-orm";
import {fail, redirect} from "@sveltejs/kit";
import {invalidateGuestSession, invalidateSession, validateSessionToken} from "$lib/server/auth.js";

export const actions = {
    createDomain: async (event) => {
        if (event.locals.user.isGuest) return fail(403, { message: 'Guest users cannot create domains' });
        // verify session
        if (!event.locals.session) return fail(401, { message: 'Unauthorized' });
        if (!event.locals.user) return fail(401, { message: 'Unauthorized' });
        if ((await validateSessionToken(event.cookies.get('auth-session'))).session.id !== event.locals.session.id) {
            try {await invalidateSession(event.locals.session.id)} catch {}
            try {await invalidateGuestSession(event.locals.session.id)} catch {}
            return fail(403, { message: "Invalid session token. Reload and log back in." })
        }

        const formData = await event.request.formData();
        const domain = event.params.domain;

        if (!domain || typeof domain !== 'string' || !/^[a-z0-9-]+$/.test(domain) || domain.length >= 16) {
            return fail(400, { message: 'Invalid domain name' });
        }

        const [existingDomain] = await db
            .select()
            .from(table.domain)
            .where(eq(table.domain.domain, domain));

        if (existingDomain) {
            return fail(400, { message: 'Domain already exists' });
        }

        const description = formData.get('description') || '';
        if (description.length > 1000) {
            return fail(400, { message: 'Description is too long' });
        }
        if (description.length < 3) {
            return fail(400, { message: 'Description is too short' });
        }
        const whyShould = formData.get('whyShould') || '';
        if (whyShould.length > 1000) {
            return fail(400, { message: 'Why should this domain be created is too long' });
        }
        if (whyShould.length < 3) {
            return fail(400, { message: 'Why should this domain be created is too short' });
        }

        await db.insert(table.domain).values({ domain });
        return redirect(302, `/${domain}`);
    }
}