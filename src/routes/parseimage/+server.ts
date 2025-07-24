import sharp from "sharp";
import {error} from "@sveltejs/kit";

export const POST = async ({ locals, request }) => {
    try {
        if (!locals.user || locals.user.isGuest) {
            return new Response("Unauthorized", { status: 401 });
        }
        const formData = await request.formData();
        const image = formData.get("image");
        let imageUpload: string;
        if (image.size === 0) {
            return new Response("No image provided", { status: 400 });
        }

        let photoId = crypto.randomUUID()
        const buffer = Buffer.from(await image.arrayBuffer());
        await sharp(buffer)
            .resize({width: 1200, withoutEnlargement: true})
            .jpeg({quality: 60})
            .toFile(`public/images/${photoId}.jpg`);

        return new Response(photoId);
    } catch {
        return error(500, "Failed to process image upload");
    }
}