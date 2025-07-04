import {db, newsgroupAddress} from "$lib/server/db/index.js";
import {eq} from "drizzle-orm";

export const GET = async ({ url, params }) => {
    // get post id
    let postId = url.searchParams.get('postId');
    let page = url.searchParams.get('page') || 1;

    let table = newsgroupAddress(params.address);
    return db
        .select()
        .from(table)
        .where(eq(table.replyTo, postId))
        .orderBy(table.createdAt.desc())
        .limit(25)
        .offset((page - 1) * 25);
}