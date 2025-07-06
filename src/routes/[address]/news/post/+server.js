import {db, newsgroupAddress} from "$lib/server/db/index.js";
import {desc, eq} from "drizzle-orm";

export const GET = async ({ url, params }) => {
    let table = newsgroupAddress(params.address);

    return new Response(JSON.stringify({
        posts: await db
            .select()
            .from(table)
            .where(eq(table.type, 'post'))
            .orderBy(desc(table.createdAt))
            .limit(100)
    }), { status: 200 });
}

export const DELETE = async ({ url, params, locals }) => {
    const postId = url.searchParams.get('id');
    if (!postId) {
        return new Response('Post ID is required', { status: 400 });
    }

    const table = newsgroupAddress(params.address);

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

    await db.delete(table).where(eq(table.id, postId));

    return new Response('Post deleted successfully', { status: 200 });
}