import fs from 'node:fs/promises';
import path from "node:path";
import {error} from "@sveltejs/kit";

export const GET = async ({ params }) => {
    const pathName = path.resolve("/public/images" , params.path)

    console.log(pathName);

    try {
        const file = await fs.readFile(pathName)
        return new Response(file)
    } catch {
        throw error(404) // use 404 (not found) here
    }
}