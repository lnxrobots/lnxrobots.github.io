import { route, hasPublicDir } from "@/lib/server";
export const runtime = "nodejs";
export const GET = route(async () => Response.json({ siteUrl: process.env.ADMIN_SITE_URL || "http://localhost:3000", hasPublic: await hasPublicDir() }));
