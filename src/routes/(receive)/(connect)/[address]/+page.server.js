import {db} from "$lib/server/db/index.js";
import * as table from "$lib/server/db/schema.ts";
import {eq} from "drizzle-orm";
import {fail, redirect} from "@sveltejs/kit";
import {invalidateGuestSession, invalidateSession, validateSessionToken} from "$lib/server/auth.js";

export const actions = {
}