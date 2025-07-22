import { dev } from '$app/environment';
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
    return dev && param.includes("chat/connect");
};