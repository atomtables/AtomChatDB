import {db} from "$lib/server/db/index.js";
import {groupaddr} from "$lib/server/db/schema";
import {eq, sql} from "drizzle-orm";
import {groups} from "$lib/server/db/schema.js";

export default async (group: string) => {
    const table = groupaddr('news.groups.proposals');

    let [message] = await db
        .select()
        .from(table)
        .where(eq(table.id, group))
    if (!message) throw new Error();

    let address = message.title;
    let content = message.content;

    let title = /\+(chat|news)=/gm.exec(content)?.[1] || null;
    let description = /^\+\+Description\+ (.*) end==$/gms.exec(content)?.[1] || null;
    let reason = /^\+\+\+Reason\+ (.*) end===$/gms.exec(content)?.[1] || null;

    if (!title || !description || !reason) {
        await db
            .insert(table)
            // @ts-ignore
            .values({
                id: crypto.randomUUID(),
                type: "reply",

                title: `RE: ${address}`,
                content: "The proposal attached does not contain all necessary parametres, or has been malformed. As such, this proposal has been rejected without prejudice. Please try later, ensuring that all data is correct.",
                replyTo: group,

                authorId: "internalsystem",
                username: "AtomChatDB Internal System",
                sentByGuest: false
            });
        return;
    }
    if (!address || !/^([a-z]+)(\.[a-z]+)(\.[a-z]+)?(\.[a-z]+)?$/g.test(address) || !address.split('.').reduce((init, cur) => init && cur.length <= 16, true)) {
        await db
            .insert(table)
            // @ts-ignore
            .values({
                id: crypto.randomUUID(),
                type: "reply",

                title: `RE: ${address}`,
                content: "The proposal attached does not contain a valid address, or has been malformed. As such, this proposal has been rejected without prejudice. Please try later, ensuring that all data is correct.",
                replyTo: group,

                authorId: "internalsystem",
                username: "AtomChatDB Internal System",
                sentByGuest: false
            });
        return;
    }

    if (address.split('.').at(0) !== 'alt') {
        await db
            .insert(table)
            // @ts-ignore
            .values({
                id: crypto.randomUUID(),
                type: "reply",

                title: `RE: ${address}`,
                content: "The proposal attached is attempting to create a group in an area where the creation of new groups is not permitted. As such, this proposal has been rejected with prejudice. \nTo test creating a group, try creating a group under the alt.* domain, which has been reserved for test groups.",
                replyTo: group,

                authorId: "internalsystem",
                username: "AtomChatDB Internal System",
                sentByGuest: false
            });
        return;
    }

    let [existingGroup] = await db
        .select()
        .from(groups)
        .where(eq(groups.address, address));

    if (existingGroup) {
        await db
            .insert(table)
            // @ts-ignore
            .values({
                id: crypto.randomUUID(),
                type: "reply",

                title: `RE: ${address}`,
                content: "The proposal attached is attempting to create a group that already exists. As such, this proposal has been rejected with prejudice.",
                replyTo: group,

                authorId: "internalsystem",
                username: "AtomChatDB Internal System",
                sentByGuest: false
            });
        return;
    }

    await db
        .insert(groups)
        .values({
            address: address,
            createdBy: message.authorId,
            description: description,
            type: title
        })

    await db.execute(`CREATE TABLE IF NOT EXISTS "address_${address}" (LIKE "group_template" INCLUDING ALL)`);
    await db.execute(`ALTER TABLE "address_${address}" ADD CONSTRAINT "${address}_replyTo_${address}_id_fk" FOREIGN KEY ("replyTo") REFERENCES "public"."address_${address}"("id") ON DELETE no action ON UPDATE no action`)

    await db
        .insert(table)
        // @ts-ignore
        .values({
            id: crypto.randomUUID(),
            type: "reply",

            title: `RE: ${address}`,
            content: "The proposal has been accepted. You can now access the group at " + address + ".",
            replyTo: group,

            authorId: "internalsystem",
            username: "AtomChatDB Internal System",
            sentByGuest: false
        });
}