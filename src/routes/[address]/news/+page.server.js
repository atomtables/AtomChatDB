import {db, newsgroupAddress} from "$lib/server/db/index.js";
import {asc, desc, eq} from "drizzle-orm";
import * as auth from "$lib/server/auth.js";
import {invalidateGuestSession, invalidateSession, validateSessionToken} from "$lib/server/auth.js";
import {fail} from "@sveltejs/kit";

export const load = async ({ params, fetch }) => {
    return {
        data: (await (await fetch(`/${params.address}/news/post`, { method: 'GET' })).json()).posts
    }
};

export const actions = {
    createPost: async (event) => {
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

        console.log(content);

        const table = newsgroupAddress(address);
        await db.insert(table).values({
            id: crypto.randomUUID(),
            type: "post",
            title,
            content,
            image: imageUpload,
            username: event.locals.user.username,
            authorId: event.locals.user.id,
            sentByGuest: event.locals.user.isGuest,
        });

        return { status: 200, body: { message: 'Post created successfully' } };
    },
    replyPost: async (event) => {
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

        const formData = await event.request.formData();
        const image = formData.get('image');
        let imageUpload;
        const table = newsgroupAddress(event.params.address);

        if (!(image instanceof File) || image.size === 0) {}
        else {
            const buffer = Buffer.from(await image.arrayBuffer());
            const base64 = buffer.toString('base64');
            const mime = image.type;
            imageUpload = `data:${mime};base64,${base64}`;
        }

        const content = formData.get('content') || '';
        const postId = formData.get('postId');

        if (!content || content.length < 3 || content.length > 5000) {
            return fail(400, { message: 'Content must be between 3 and 5000 characters' });
        }

        if (!postId) {
            return fail(400, { message: 'Post ID is required' });
        }
        let [postExists] = await db
            .select()
            .from(table)
            .where(eq(table.id, postId))
            .limit(1);
        if (!postExists) {
            return fail(404, { message: 'Post not found' });
        }

        await db.insert(table).values({
            id: crypto.randomUUID(),
            type: "reply",
            title: formData.get('title') || '',
            content,
            image: imageUpload,
            username: event.locals.user.username,
            authorId: event.locals.user.id,
            sentByGuest: event.locals.user.isGuest,
            replyTo: postId
        });

        return { status: 200, body: { message: 'Reply created successfully' } };
    }
}