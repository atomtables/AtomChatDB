import {db, newsgroupAddress} from "$lib/server/db/index.js";
import {asc, eq} from "drizzle-orm";
import * as auth from "$lib/server/auth.js";
import {invalidateGuestSession, invalidateSession, validateSessionToken} from "$lib/server/auth.js";
import {fail} from "@sveltejs/kit";

export const load = async ({ params, depends }) => {
    depends(`news:${params.address}`);
    let table = newsgroupAddress(params.address);

    return {
        data: db
            .select()
            .from(table)
            .where(eq(table.type, 'post'))
            .orderBy(asc(table.createdAt))
            .limit(100)
    };
};

export const actions = {
    createPost: async (event) => {
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

        const formData = await event.request.formData();
        const image = formData.get('image');
        let imageUpload;

        if (!(image instanceof File) || image.size === 0) {}
        else {
            const buffer = Buffer.from(await image.arrayBuffer());
            const base64 = buffer.toString('base64');
            const mime = image.type;
            imageUpload = `data:${mime};base64,${base64}`;
        }

        const title = formData.get('title') || '';
        const content = formData.get('content') || '';
        const address = event.params.address;

        if (!content || content.length < 3 || content.length > 5000) {
            return fail(400, { message: 'Content must be between 3 and 5000 characters' });
        }

        const table = newsgroupAddress(address);
        await db.insert(table).values({
            id: crypto.randomUUID(),
            type: "post",
            title,
            content,
            image: imageUpload,
            username: event.locals.user.username,
            createdBy: event.locals.user.id,
            sentByGuest: event.locals.user.isGuest,
        });

        return { status: 200, body: { message: 'Post created successfully' } };
    }
}