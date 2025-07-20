import {fail, redirect} from "@sveltejs/kit";
import sharp from "sharp";
import * as table from "$lib/server/db/schema.js";
import {db} from "$lib/server/db/index.js";
import {eq} from "drizzle-orm";

export const load = async ({locals}) => {
    if (!locals.user) return redirect(302, '/auth/login')
}

export const actions = {
    default: async ({locals, request}) => {
        if (!locals.user) return { status: 401, body: { message: 'Unauthorized' } };
        if (locals.user.isGuest) return fail(403, { message: 'No access to guests.' });

        const formData = await request.formData();
        const image = formData.get('image');
        let imageUpload;
        if (!(image instanceof File) || image.size === 0) {
            return fail(400, { message: 'Image is required' });
        }
        const buffer = Buffer.from(await image.arrayBuffer());
        await sharp(buffer)
            .resize({width: 256})
            .jpeg({quality: 70})
            .toFile(`public/dp/${locals.user.username}.jpg`);

        await db.update(table.user)
            .set({ image: true })
            .where(eq(table.user.id, locals.user.id));

        return redirect(302, '/');
    }
};