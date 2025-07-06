import {db, newsgroupAddress} from "$lib/server/db/index.js";
import {asc, desc, eq} from "drizzle-orm";

export const GET = async ({ url, params }) => {
    // get post id
    let postId = url.searchParams.get('id');
    let page = url.searchParams.get('page') || 1;

    if (!postId) {
        return new Response('Post ID is required', { status: 400 });
    }

    let table = newsgroupAddress(params.address);
    return new Response(JSON.stringify({
            replies: await db
                .select()
                .from(table)
                .where(eq(table.replyTo, postId))
                .orderBy(asc(table.createdAt))
                .limit(25)
                .offset((page - 1) * 25)
        }),
        { status: 200 }
    );
}

export const DELETE = async ({ url, params, locals }) => {
    const replyId = url.searchParams.get('id');
    if (!replyId) {
        return new Response('Reply ID is required', { status: 400 });
    }

    const table = newsgroupAddress(params.address);

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

    await db.delete(table).where(eq(table.id, replyId));

    return new Response('Reply deleted successfully', { status: 200 });
}