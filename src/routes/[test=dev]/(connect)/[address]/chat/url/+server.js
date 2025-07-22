import {env} from '$env/dynamic/private';
import {dev} from '$app/environment';
export const GET = async ({params}) => {
    return new Response(dev ? `${params.address}/chat/conenct` : env.SOCKET_URL);
}