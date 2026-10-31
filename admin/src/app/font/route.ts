import { route, fileResponse, FONT_FILE } from "@/lib/server";
export const runtime = "nodejs";
/** The site's own display font, so the editor's wordmark matches. */
export const GET = route(async () => fileResponse(FONT_FILE, true));
