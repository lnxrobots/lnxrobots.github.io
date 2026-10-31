import { route, gitInfo } from "@/lib/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = route(async () => Response.json(await gitInfo()));
