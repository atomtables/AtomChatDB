import {db, groupaddr} from "$lib/server/db/index.js";
import {asc, desc, eq} from "drizzle-orm";
import {fail} from "@sveltejs/kit";
import {invalidateGuestSession, invalidateSession, validateSessionToken} from "$lib/server/auth.js";
import * as auth from "$lib/server/auth.js";

export const GET = async ({ url, params }) => {
    // get post id
    let postId = url.searchParams.get('id');
    let page = url.searchParams.get('page') || 1;

    if (!postId) {
        return new Response('Post ID is required', { status: 400 });
    }

    let table = groupaddr(params.address);
    let replies = await db
        .select()
        .from(table)
        .where(eq(table.replyTo, postId))
        .orderBy(asc(table.createdAt))
        .offset((page - 1) * 25)
    for (let i = 0, reply = replies[i]; i < replies.length; i++, reply = replies[i]) {
        if (reply.deleted) {
            reply.authorId = null;
            reply.username = '[deleted]';
            reply.content = '[reply was deleted]';
            reply.image = null;
        }
    }
    return new Response(JSON.stringify({
            replies: replies
        }),
        { status: 200 }
    );
}

export const POST = async (event) => {
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
    const table = groupaddr(event.params.address);

    if (!(image instanceof File) || image.size === 0) {}
    else {
        let res = await event.fetch("/parseimage", {
            method: 'POST',
            body: formData,
            duplex: 'half'
        })
        if (!res.ok) {
            return fail(400, { message: 'Image upload failed' });
        }
        imageUpload = await res.text();
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

    return new Response(JSON.stringify({ status: 200, data: { message: 'Reply created successfully' } }), {status: "200"});
}

export const DELETE = async ({ url, params, locals }) => {
    const replyId = url.searchParams.get('id');
    if (!replyId) {
        return new Response('Reply ID is required', { status: 400 });
    }

    const table = groupaddr(params.address);

    const [reply] = await db
        .select()
        .from(table)
        .where(eq(table.id, replyId));

    if (!reply) {
        return new Response('Reply not found', { status: 404 });
    }

    if (reply.authorId !== locals.user.id || locals.user.isGuest) {
        return new Response('Unauthorized to delete this reply', { status: 403 });
    }

    await db.update(table).set({deleted: true}).where(eq(table.id, replyId));

    return new Response('Reply deleted successfully', { status: 200 });
}