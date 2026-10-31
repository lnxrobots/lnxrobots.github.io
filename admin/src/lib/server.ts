import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { readConsts, renderConsts, maskSource, findConst, evalLiteral, canon, type Obj } from "./tsdata";

/* ───────── paths ───────── */

/** The website project is the folder that contains this `admin/` app. */
export const ROOT = process.env.LNX_PROJECT_ROOT ? path.resolve(process.env.LNX_PROJECT_ROOT) : path.resolve(process.cwd(), "..");
export const DATA_DIR = path.join(ROOT, "src", "data");
export const PUBLIC_DIR = path.join(ROOT, "public");
export const CONTENT_DIR = path.join(PUBLIC_DIR, "content");
export const FONT_FILE = path.join(ROOT, "src", "app", "fonts", "AquireBold.otf");
const BACKUP_DIR = path.join(process.cwd(), ".backups");
const MAX_UPLOAD = 100 * 1024 * 1024; // GitHub rejects files over 100 MB
const KEEP_BACKUPS = 40;

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Only answer requests that come from this machine's own editor page. */
export function checkRequest(req: Request): void {
  const host = req.headers.get("host") || "";
  if (!/^(localhost|127\.0\.0\.1):\d+$/.test(host)) throw new HttpError(403, "Forbidden host.");
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (req.headers.get("x-admin-request") !== "1") throw new HttpError(403, "Missing admin header.");
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== host) throw new HttpError(403, "Cross-origin request blocked.");
  }
}

/** Wraps a route handler: origin checks + consistent JSON errors. */
export function route(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      checkRequest(req);
      return await handler(req);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      if (status === 500) console.error(e);
      return Response.json({ error: (e as Error).message || String(e) }, { status });
    }
  };
}

/* ───────── data files ───────── */

const DATASETS = {
  site: { file: "site.ts", consts: ["site"] },
  teams: { file: "teams.ts", consts: ["teams"] },
  achievements: { file: "achievements.ts", consts: ["achievements"] },
  sponsors: { file: "sponsors.ts", consts: ["sponsors", "fundingNote"] },
  disciplines: { file: "disciplines.ts", consts: ["disciplines"] },
  media: { file: "media.ts", consts: ["mediaDescriptions"] },
} as const;
type DatasetName = keyof typeof DATASETS;

const CONST_TO_DATASET: Record<string, DatasetName> = Object.fromEntries(
  (Object.entries(DATASETS) as [DatasetName, { consts: readonly string[] }][]).flatMap(([ds, d]) => d.consts.map((c) => [c, ds])),
);

/** src/data/media.ts is created by the editor the first time descriptions are saved. */
const MEDIA_TEMPLATE = `/**
 * Descriptions (alt text) of uploaded images, keyed by file path.
 * Managed by the content editor (admin/): write a description once and every gallery
 * showing that image uses it. Gallery items still carry their own \`alt\`, kept in sync.
 */
export const mediaDescriptions: Record<string, string> = {};
`;

const sha = (text: string) => crypto.createHash("sha1").update(text).digest("hex");

async function readDataset(ds: DatasetName) {
  const { file, consts } = DATASETS[ds];
  let text: string;
  try {
    text = await fs.readFile(path.join(DATA_DIR, file), "utf8");
  } catch (e) {
    if (ds === "media" && (e as NodeJS.ErrnoException).code === "ENOENT") text = MEDIA_TEMPLATE;
    else throw e;
  }
  try {
    return { text, values: readConsts(text, [...consts]), version: sha(text) };
  } catch (e) {
    throw new Error(`src/data/${file}: ${(e as Error).message}`);
  }
}

export async function readAll() {
  const data: Obj = {};
  const versions: Record<string, string> = {};
  for (const ds of Object.keys(DATASETS) as DatasetName[]) {
    const r = await readDataset(ds);
    Object.assign(data, r.values);
    versions[ds] = r.version;
  }
  return { data, versions };
}

function validateShape(values: Obj): void {
  for (const k of ["teams", "achievements", "sponsors", "disciplines"]) {
    if (k in values && !Array.isArray(values[k])) throw new Error(`"${k}" must be a list.`);
  }
  if ("site" in values && (typeof values.site !== "object" || Array.isArray(values.site))) throw new Error('"site" must be an object.');
  if ("mediaDescriptions" in values) {
    const m = values.mediaDescriptions;
    if (!m || typeof m !== "object" || Array.isArray(m) || Object.values(m).some((v) => typeof v !== "string")) throw new Error('"mediaDescriptions" must map file paths to text.');
  }
  if ("fundingNote" in values && typeof values.fundingNote !== "string") throw new Error('"fundingNote" must be text.');
  const dup = (list: Obj[], key: string, label: string) => {
    const seen = new Set<string>();
    for (const x of list) {
      if (seen.has(x[key])) throw new Error(`Duplicate ${label}: "${x[key]}".`);
      seen.add(x[key]);
    }
  };
  if (values.teams) {
    dup(values.teams, "slug", "team slug");
    dup(values.teams.flatMap((t: Obj) => t.campaigns || []), "id", "competition entry id");
  }
  if (values.achievements) dup(values.achievements, "id", "result id");
  if (values.disciplines) dup(values.disciplines, "slug", "competition slug");
}

export async function saveDatasets(body: { values: Obj; base?: Record<string, string> }) {
  const { values, base } = body;
  validateShape(values);
  const touched = [...new Set(Object.keys(values).map((c) => CONST_TO_DATASET[c]).filter(Boolean))];
  if (!touched.length) throw new Error("Nothing to save.");

  // 1. Work out every new file in memory and verify it before touching the disk.
  const plans: { ds: DatasetName; file: string; before: string; after: string }[] = [];
  for (const ds of touched) {
    const cur = await readDataset(ds);
    if (base?.[ds] && base[ds] !== cur.version) {
      throw new HttpError(409, `src/data/${DATASETS[ds].file} changed on disk since you opened the editor (edited by hand, or by git?). Reload the editor to pick up those changes before saving.`);
    }
    const mine = Object.fromEntries(DATASETS[ds].consts.filter((c) => c in values).map((c) => [c, values[c]]));
    const next = renderConsts(cur.text, mine);
    const masked = maskSource(next);
    for (const c of Object.keys(mine)) {
      const { start, end } = findConst(masked, c);
      if (canon(evalLiteral(next.slice(start, end))) !== canon(mine[c])) {
        throw new Error(`Safety check failed for "${c}": the rewritten file didn't read back identically, so nothing was saved.`);
      }
    }
    plans.push({ ds, file: DATASETS[ds].file, before: cur.text, after: next });
  }

  // 2. Back up the originals, then write each file atomically.
  const changed = plans.filter((p) => p.before !== p.after);
  if (changed.length) {
    const dir = await backupDir();
    // Keep the *first* copy of each file per session, so "Live preview" auto-saves don't bury the original.
    for (const p of changed) if (!(await exists(path.join(dir, p.file)))) await fs.writeFile(path.join(dir, p.file), p.before);
    for (const p of changed) {
      const target = path.join(DATA_DIR, p.file);
      await fs.writeFile(`${target}.admin-tmp`, p.after);
      await fs.rename(`${target}.admin-tmp`, target);
    }
    pruneBackups().catch(() => {});
  }
  const versions: Record<string, string> = {};
  for (const p of plans) versions[p.ds] = sha(p.after);
  return { versions, changedFiles: changed.map((p) => `src/data/${p.file}`) };
}

/** A backup folder per editing session: reuse the latest one if it's under two minutes old. */
async function backupDir(): Promise<string> {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const dirs = (await fs.readdir(BACKUP_DIR, { withFileTypes: true })).filter((d) => d.isDirectory() && d.name !== "deleted-files").map((d) => d.name).sort();
  const last = dirs[dirs.length - 1];
  if (last) {
    const t = Date.parse(last.replace(/^(\d{4}-\d\d-\d\d)T(\d\d)-(\d\d)-(\d\d)-(\d+)Z$/, "$1T$2:$3:$4.$5Z"));
    if (Date.now() - t < 120_000) return path.join(BACKUP_DIR, last);
  }
  const dir = path.join(BACKUP_DIR, new Date().toISOString().replace(/[:.]/g, "-"));
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function pruneBackups() {
  const dirs = (await fs.readdir(BACKUP_DIR, { withFileTypes: true })).filter((d) => d.isDirectory() && d.name !== "deleted-files").map((d) => d.name).sort();
  for (const d of dirs.slice(0, Math.max(0, dirs.length - KEEP_BACKUPS))) await fs.rm(path.join(BACKUP_DIR, d), { recursive: true, force: true });
}

/* ───────── media ───────── */

const UPLOAD_EXT = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "pdf", "zip", "txt", "md", "csv",
  "doc", "docx", "ppt", "pptx", "xls", "xlsx", "odt", "ods", "odp",
]);

export const MIME: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", avif: "image/avif",
  svg: "image/svg+xml", pdf: "application/pdf", zip: "application/zip", txt: "text/plain; charset=utf-8",
  md: "text/plain; charset=utf-8", csv: "text/csv; charset=utf-8", otf: "font/otf",
};
const extOf = (f: string) => path.extname(f).slice(1).toLowerCase();

function safeFileName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const base =
    path.basename(name, path.extname(name)).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[-.]+|[-.]+$/g, "") || "file";
  return base + ext;
}

function resolveContentDir(dir: string | null): string {
  const parts = String(dir || "").split("/").filter(Boolean);
  if (!parts.length) throw new HttpError(400, "Choose a folder to upload into.");
  for (const p of parts) {
    if (p === "." || p === ".." || !/^[A-Za-z0-9._-]+$/.test(p)) throw new HttpError(400, `Folder name "${p}" isn't allowed (use letters, numbers, - and _).`);
  }
  const abs = path.join(CONTENT_DIR, ...parts);
  if (!abs.startsWith(CONTENT_DIR + path.sep)) throw new HttpError(400, "Invalid folder.");
  return abs;
}

/** Maps "/content/x/y.jpg" (or ["x","y.jpg"]) to an absolute path inside public/content, or throws. */
export function resolveContentFile(rel: string): string {
  const abs = path.resolve(CONTENT_DIR, rel.replace(/^\/?content\//, ""));
  if (!abs.startsWith(CONTENT_DIR + path.sep)) throw new HttpError(400, "Invalid path.");
  return abs;
}

const exists = (p: string) => fs.access(p).then(() => true, () => false);

async function uniqueName(dirAbs: string, name: string): Promise<string> {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  let candidate = name;
  for (let n = 1; await exists(path.join(dirAbs, candidate)); n++) candidate = `${base}-${n}${ext}`;
  return candidate;
}

export interface MediaFile { path: string; size: number; mtime: number; ext: string }

export async function listMedia(): Promise<MediaFile[]> {
  const out: MediaFile[] = [];
  async function walk(dir: string) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) await walk(abs);
      else {
        const st = await fs.stat(abs);
        out.push({ path: `/content/${path.relative(CONTENT_DIR, abs).split(path.sep).join("/")}`, size: st.size, mtime: st.mtimeMs, ext: extOf(e.name) });
      }
    }
  }
  await walk(CONTENT_DIR);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

export async function deleteMedia(rel: string): Promise<void> {
  const abs = resolveContentFile(rel);
  if (!(await exists(abs))) throw new HttpError(404, "File not found.");
  const trash = path.join(BACKUP_DIR, "deleted-files", new Date().toISOString().replace(/[:.]/g, "-"));
  await fs.mkdir(trash, { recursive: true });
  await fs.copyFile(abs, path.join(trash, path.basename(abs)));
  await fs.unlink(abs);
}

export async function saveUpload(dir: string | null, rawName: string, body: ArrayBuffer): Promise<MediaFile> {
  const dirAbs = resolveContentDir(dir);
  const name = safeFileName(rawName || "file");
  if (!UPLOAD_EXT.has(extOf(name))) throw new HttpError(400, `".${extOf(name) || "?"}" files aren't supported here. Allowed: images, PDF, ZIP, Office documents, text.`);
  if (!body.byteLength) throw new HttpError(400, "The file is empty.");
  if (body.byteLength > MAX_UPLOAD) throw new HttpError(413, "That file is larger than 100 MB, which GitHub won't accept.");
  await fs.mkdir(dirAbs, { recursive: true });
  const finalName = await uniqueName(dirAbs, name);
  await fs.writeFile(path.join(dirAbs, finalName), Buffer.from(body));
  return { path: `/content/${path.relative(CONTENT_DIR, path.join(dirAbs, finalName)).split(path.sep).join("/")}`, size: body.byteLength, mtime: Date.now(), ext: extOf(finalName) };
}

export async function fileResponse(abs: string, cache = false): Promise<Response> {
  try {
    const buf = await fs.readFile(abs);
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": MIME[extOf(abs)] || "application/octet-stream", "Cache-Control": cache ? "max-age=3600" : "no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    throw new HttpError(404, "Not found");
  }
}

export const hasPublicDir = () => exists(PUBLIC_DIR);

/* ───────── git (read-only) ───────── */

const git = (args: string[]) =>
  new Promise<{ err: Error | null; stdout: string }>((resolve) =>
    execFile("git", ["-C", ROOT, ...args], { maxBuffer: 8 * 1024 * 1024 }, (err, stdout) => resolve({ err, stdout })),
  );

export async function gitInfo() {
  const inside = await git(["rev-parse", "--is-inside-work-tree"]);
  if (inside.err || inside.stdout.trim() !== "true") return { available: false as const };
  const [branch, status, diff] = await Promise.all([
    git(["branch", "--show-current"]),
    git(["status", "--porcelain=v1", "-uall", "--", "src", "public"]),
    git(["diff", "--no-color", "--", "src/data"]),
  ]);
  const files = status.stdout.split("\n").filter(Boolean).map((l) => ({ status: l.slice(0, 2).trim() || "M", file: l.slice(3).replace(/^"|"$/g, "") }));
  const MAX = 200_000;
  return { available: true as const, branch: branch.stdout.trim(), files, diff: diff.stdout.slice(0, MAX), diffTruncated: diff.stdout.length > MAX };
}
