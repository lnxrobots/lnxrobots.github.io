import { route, resolveContentFile, fileResponse } from "@/lib/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Serves uploaded files from the site's public/content so previews work. */
export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return route(async () => fileResponse(resolveContentFile(path.map(decodeURIComponent).join("/"))))(req);
}
