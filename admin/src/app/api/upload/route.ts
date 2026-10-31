import { route, saveUpload } from "@/lib/server";
export const runtime = "nodejs";
export const POST = route(async (req) => {
  const q = new URL(req.url).searchParams;
  return Response.json({ file: await saveUpload(q.get("dir"), q.get("name") || "file", await req.arrayBuffer()) });
});
