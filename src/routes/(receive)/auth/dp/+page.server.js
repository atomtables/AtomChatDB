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

        const formData = await request.formData();
        const image = formData.get('image');
        let imageUpload;
        if (!(image instanceof File) || image.size === 0) {
            return fail(400, { message: 'Image is required' });
        }
        const buffer = Buffer.from(await image.arrayBuffer());
        const compressed = await sharp(buffer).resize({width: 400}).jpeg({quality: 70}).toBuffer();
        const base64 = compressed.toString('base64');
        imageUpload = `data:image/jpeg;base64,${base64}`;

        await db.update(table.user)
            .set({ image: imageUpload })
            .where(eq(table.user.id, locals.user.id));

        // Redirect to login page
        return redirect(302, '/');
    }
};