import {db, groupaddr} from "$lib/server/db/index.js";
import {and, desc, eq} from "drizzle-orm";
import {fail} from "@sveltejs/kit";
import {invalidateGuestSession, invalidateSession, validateSessionToken} from "$lib/server/auth.js";
import * as auth from "$lib/server/auth.js";

export const GET = async ({ url, params }) => {
    let table = groupaddr(params.address);

    let posts = await db
        .select()
        .from(table)
        .where(eq(table.type, 'post'))
        .orderBy(desc(table.createdAt))

    for (let i = 0, post = posts[i]; i < posts.length; i++, post = posts[i]) {
        if (post.deleted) {
            let [replies] = await db.select().from(table).where(eq(table.replyTo, post.id)).limit(1)
            if (replies) {
                post.content = '[post was deleted]'
                post.authorId = null;
                post.username = '[deleted]'
                post.image = null;
            } else {
                posts.splice(i, 1);
                i--;
            }
        }
    }

    return new Response(JSON.stringify({
        posts: posts
    }), { status: 200 });
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

    const title = formData.get('title') || '';
    const content = formData.get('content') || '';
    const address = event.params.address;

    if (!content || content.length < 3 || content.length > 5000) {
        return fail(400, { message: 'Content must be between 3 and 5000 characters' });
    }

    console.log(content);

    const table = groupaddr(address);
    const postId = crypto.randomUUID()
    await db.insert(table).values({
        id: postId,
        type: "post",
        title,
        content,
        image: imageUpload,
        username: event.locals.user.username,
        authorId: event.locals.user.id,
        sentByGuest: event.locals.user.isGuest,
    });

    return new Response(JSON.stringify({
        post: postId
    }, {status: 200, headers: {'Content-Type': 'application/json'}}));
}

export const DELETE = async ({ url, params, locals }) => {
    const postId = url.searchParams.get('id');
    if (!postId) {
        return new Response('Post ID is required', { status: 400 });
    }

    const table = groupaddr(params.address);

    const [post] = await db
        .select()
        .from(table)
        .where(eq(table.id, postId));

    if (!post) {
        return new Response('Post not found', { status: 404 });
    }

    if (post.authorId !== locals.user.id || locals.user.isGuest) {
        return new Response('Unauthorized to delete this post', { status: 403 });
    }

    await db.update(table)
        .set({ deleted: true })
        .where(eq(table.id, postId));

    return new Response('Post deleted successfully', { status: 200 });
}