/* Small shared helpers (client side). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Obj = Record<string, any>;

export async function api<T = Obj>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { ...opts, headers: { "X-Admin-Request": "1", ...(opts.headers || {}) } });
  const isJson = (res.headers.get("content-type") || "").includes("json");
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const err = new Error((body && body.error) || res.statusText || "Request failed") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return body as T;
}

export const slugify = (s: unknown): string =>
  String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s);
export const toArr = (v: unknown): string[] => (Array.isArray(v) ? v : v === undefined || v === null || v === "" ? [] : [v as string]);
export const rid = () => Math.random().toString(36).slice(2, 8);

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"];
export const extOf = (p: string) => (String(p).split(".").pop() || "").toLowerCase();
export const isImagePath = (p: string) => IMAGE_EXT.includes(extOf(p));
export const fileName = (p: string) => String(p).split("/").pop() || "";
export const dirOf = (p: string) => p.replace(/^\/content\//, "").split("/").slice(0, -1).join("/");
export const thisYear = () => new Date().getFullYear();

/* ───────── YouTube ───────── */

function parseTimestamp(t: string | null): string {
  if (!t) return "";
  if (/^\d+$/.test(t)) return t;
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
  if (!m || !(m[1] || m[2] || m[3])) return "";
  return String((+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0));
}

/** Accepts a YouTube URL (watch, youtu.be, embed, shorts, live) or a bare id. */
export function parseYouTube(input: string): { id: string; t: string } | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return { id: s, t: "" };
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let id = "";
  if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
    else id = /^\/(?:embed|shorts|live|v)\/([^/?]+)/.exec(u.pathname)?.[1] || "";
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
  return { id, t: parseTimestamp(u.searchParams.get("t") || u.searchParams.get("start")) };
}

/** The site stores a video as "ID" or "ID?t=SECONDS". */
export const splitVideoId = (stored: string) => {
  const [id, t] = String(stored || "").split("?t=");
  return { id, t: t || "" };
};
export const videoLink = (stored: string) => {
  const { id, t } = splitVideoId(stored);
  return id ? `https://youtu.be/${id}${t ? `?t=${t}` : ""}` : "";
};
