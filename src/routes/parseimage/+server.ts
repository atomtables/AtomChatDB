import sharp from "sharp";

export const POST = async ({ locals, request }) => {
    if (!locals.user || locals.user.isGuest) {
        return new Response("Unauthorized", { status: 401 });
    }
    const formData = await request.formData();
    const image = formData.get("image");
    let imageUpload: string;
    if (image.size === 0) {
        return new Response("No image provided", { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const compressed = await sharp(buffer).resize({width: 600}).jpeg({quality: 50}).toBuffer();
    const base64 = compressed.toString('base64');
    imageUpload = `data:image/jpeg;base64,${base64}`;

    return new Response(imageUpload);
}