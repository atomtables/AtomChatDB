import * as table from "$lib/server/db/schema";
import {eq} from "drizzle-orm";
import {db} from "$lib/server/db/index.js";
import {analytics} from "$lib/server/stores.svelte";

export const load = async ({ locals, params }) => {
    let user = locals.user;
    if (user && !user.isGuest) {
        if (user.person.at(0) === '+') {
            user.person = user.person.substring(0, 3) + "********" + user.person.at(user.person.length-1);
        } else {
            let person = user.person.split("@")
            user.person = person[0].at(0) + "*****" + person[0].at(person[0].length-1) + "@" + person[1];
        }
    }
    let address = null, values = null;

    if (params.address) {
        let [result] = await db
            .select()
            .from(table.groups)
            .where(eq(table.groups.address, params.address));

        if (result)  {
            result.createdBy = (await db.select().from(table.user).where(eq(table.user.id, result.createdBy)))[0].username;
            address = result;
        }

        values = params.address.split('.')
    }

    return {
        auth: locals.user !== null,
        user: user,
        session: locals.session,
        address,
        analytics: analytics,
        slugs: {
            address: params.address || null,
            domain: values?.[0] || null,
            class: values?.[1] || null,
            focus: values?.[2] || null,
            topic: values?.[3] || null
        }
    }
}