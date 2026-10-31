"use client";
import { useSyncExternalStore } from "react";
import { describeFromFilename, syncAlts } from "./descriptions";
import { api, fileName, fmtBytes, slugify, type Obj } from "./util";
import { loadMedia, S, type Ctx, type Field } from "./schema";
import type { Entry } from "./inspect";

/* A tiny external store: the form data is mutated in place (see schema.ts), and
 * edited() tells React to re-render. Simple, and fast enough for this data size. */

let version = 0;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));
export const bump = () => {
  version++;
  listeners.forEach((l) => l());
};
export const getVersion = () => version;
export const useStore = () => useSyncExternalStore(subscribe, () => version, () => 0);

/* ───────── auto-filled id fields ───────── */

interface Auto { obj: Obj; f: Field; ctx: Ctx }
const autos = new Set<Auto>();
export const registerAuto = (a: Auto) => (autos.add(a), () => void autos.delete(a));

/** New items get their id filled in from other fields until the person types their own. */
function syncAutos() {
  for (const a of autos) {
    if (!a.obj._new || a.obj._idTouched) continue;
    const v = slugify(a.f.auto!(a.obj, a.ctx));
    if (v !== a.obj[a.f.key]) a.obj[a.f.key] = v;
  }
}

export function edited() {
  syncAutos();
  syncAlts(S.data); // one description per image, wherever it is shown
  bump();
}

/* ───────── toasts & dialogs ───────── */

export interface Toast { id: number; message: string; kind: "info" | "success" | "error" }
export type DialogSpec =
  | { id: number; kind: "confirm"; title: string; body?: string; ok: string; danger: boolean; resolve: (v: boolean) => void }
  | { id: number; kind: "picker"; mediaKind: "image" | "all"; resolve: (v: string | null) => void };

export interface Selection { label: string; alternatives: Entry[]; container: boolean }

/** UI-only state (nothing here is written to the site). */
export const ui: {
  toasts: Toast[]; dialogs: DialogSpec[];
  /** field the preview selected: scroll to it and flash it once rendered. key "" = the whole record */
  focus: { obj: Obj; key: string } | null;
  selection: Selection | null;
  pagePath: string; editMode: boolean; device: "desktop" | "tablet" | "phone"; follow: boolean; autosave: boolean;
  bridge: "waiting" | "ok" | "missing";
  /** set when the panel route changed because of the preview, so the preview doesn't navigate back */
  suppressFollow: boolean;
} = { toasts: [], dialogs: [], focus: null, selection: null, pagePath: "/", editMode: true, device: "desktop", follow: true, autosave: false, bridge: "waiting", suppressFollow: false };
let seq = 0;

export function toast(message: string, kind: Toast["kind"] = "info", ms = 4000) {
  const t: Toast = { id: ++seq, message, kind };
  ui.toasts = [...ui.toasts, t];
  bump();
  const dismiss = () => {
    ui.toasts = ui.toasts.filter((x) => x !== t);
    bump();
  };
  if (ms) setTimeout(dismiss, kind === "error" ? Math.max(ms, 7000) : ms);
  return { dismiss };
}

export const confirmDialog = (o: { title: string; body?: string; ok?: string; danger?: boolean }) =>
  new Promise<boolean>((resolve) => {
    ui.dialogs = [...ui.dialogs, { id: ++seq, kind: "confirm", ok: "OK", danger: false, ...o, resolve }];
    bump();
  });

export async function pickMedia(mediaKind: "image" | "all" = "image"): Promise<string | null> {
  try {
    await loadMedia();
  } catch (e) {
    toast((e as Error).message, "error");
    return null;
  }
  return new Promise((resolve) => {
    ui.dialogs = [...ui.dialogs, { id: ++seq, kind: "picker", mediaKind, resolve }];
    bump();
  });
}

export function closeDialog(d: DialogSpec) {
  ui.dialogs = ui.dialogs.filter((x) => x !== d);
  bump();
}

/* ───────── uploads ───────── */

/** Downscale big photos in the browser so the repo stays light. Returns a Blob, or null to keep the original. */
async function shrinkImage(file: File, maxDim = 2000): Promise<Blob | null> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size < 1.5 * 1048576) return null;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const type = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.86));
  return blob && blob.size < file.size ? blob : null;
}

export async function uploadOne(file: File, dir: string) {
  let blob: Blob = file;
  if (S.shrink && /^image\/(jpeg|png|webp)$/.test(file.type)) {
    try {
      blob = (await shrinkImage(file)) || file;
    } catch {
      blob = file;
    }
  }
  const res = await api<{ file: (typeof S.media)[number] }>(`/api/upload?dir=${encodeURIComponent(dir)}&name=${encodeURIComponent(file.name)}`, {
    method: "POST",
    body: blob,
    headers: { "Content-Type": blob.type || "application/octet-stream" },
  });
  S.media.push(res.file);
  // New image: start its description from the file name (only if it has none yet).
  const lib: Obj = (S.data.mediaDescriptions ||= {});
  if (!(res.file.path in lib)) {
    const d = describeFromFilename(file.name);
    if (d && /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(res.file.path)) lib[res.file.path] = d;
  }
  if (res.file.size > 50 * 1048576) toast(`${fileName(res.file.path)} is ${fmtBytes(res.file.size)} — GitHub warns about files over 50 MB.`, "error");
  return res.file;
}

/** The upload folder for a field, or null (with a message) if it can't be worked out yet. */
export function resolveDir(f: Field, ctx: Ctx): string | null {
  const dir = f.dir!(ctx);
  if (!/^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/.test(dir) || dir.split("/").some((p) => p === "." || p === "..")) {
    toast("Fill in the address name (id) first — uploads are filed in a folder named after it.", "error");
    return null;
  }
  return dir;
}
