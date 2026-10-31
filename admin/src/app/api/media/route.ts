import { route, listMedia, deleteMedia, HttpError } from "@/lib/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = route(async () => Response.json({ files: await listMedia() }));
export const DELETE = route(async (req) => {
  const p = new URL(req.url).searchParams.get("path");
  if (!p) throw new HttpError(400, "Missing path.");
  await deleteMedia(p);
  return Response.json({ ok: true });
});
