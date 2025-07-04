import {db, newsgroupAddress} from "$lib/server/db/index.js";
import {asc, desc, eq} from "drizzle-orm";

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