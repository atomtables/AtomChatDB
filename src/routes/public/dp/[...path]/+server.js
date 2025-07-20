import fs from 'node:fs/promises';
import path from "node:path";
import {redirect} from "@sveltejs/kit";

export const GET = async ({ params }) => {
    const pathName = path.resolve("public/dp" , params.path)

    console.log(pathName);

    try {
        const file = await fs.readFile(pathName)
        return new Response(file)
    } catch {
        return redirect(302, `https://api.dicebear.com/5.x/initials/jpg?seed=${params.path}`)
    }
}