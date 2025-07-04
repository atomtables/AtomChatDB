import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.js";
import {eq} from "drizzle-orm";

export const load = async ({ params }) => {
    let [result] = await db
        .select()
        .from(table.groups)
        .where(eq(table.groups.address, params.address));

    let address = null;

    if (result)  {
        result.createdBy = (await db.select().from(table.user).where(eq(table.user.id, result.createdBy)))[0].username;
        address = result;
    }

    let values = params.address.split('.')

    return {
        address,
        slugs: {
            // surprisingly this works lmao
            domain: values[0],
            class: values[1] || null,
            focus: values[2] || null,
            topic: values[3] || null
        }
    }
}