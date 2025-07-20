import fs from 'node:fs/promises';
import path from "node:path";

export const GET = async ({ params, fetch }) => {
    const pathName = path.resolve("public/dp" , params.path)

    console.log(pathName);

    try {
        const file = await fs.readFile(pathName)
        return new Response(file)
    } catch {
        return new Response(await fetch(`https://api.dicebear.com/5.x/initials/jpg?seed=${params.path}`))
    }
}