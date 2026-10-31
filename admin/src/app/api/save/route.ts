import { route, saveDatasets } from "@/lib/server";
export const runtime = "nodejs";
export const POST = route(async (req) => Response.json(await saveDatasets(await req.json())));
