/**
 * Image descriptions (alt text) are stored once per image, in the media library
 * (src/data/media.ts: file path → description), and kept in sync with every gallery
 * that shows that image. The website itself still just reads each gallery item's `alt`.
 * Pure functions, so they're easy to test.
 */
import type { Obj } from "./util";

/** Words from camera/phone/screenshot names that say nothing about the picture. */
const JUNK = /^(img|image|images|dsc|dscn|dscf|dcim|pxl|mvimg|photo|photos|pic|pics|picture|screenshot|screen|snap|scan|wp|fotka|obrazok|signal|whatsapp|vid|copy|untitled|file)$/i;

/**
 * "Team-1-at-RoboCup_2025_final.jpg" → "Team 1 at RoboCup 2025 final".
 * Camera names like IMG_20250712_134501.jpg say nothing, so they give "" (the editor then asks for a real description).
 */
export function describeFromFilename(filename: string): string {
  const base = filename.replace(/^.*[\\/]/, "").replace(/\.[A-Za-z0-9]{2,5}$/, "");
  const raw = base
    .replace(/[_\-.+]+/g, " ")
    .replace(/[()[\]{}]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const words: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const w = raw[i];
    if (JUNK.test(w)) {
      if (/^\d{1,5}$/.test(raw[i + 1] ?? "")) i++; // "IMG 1234", "photo 1": the number goes with the prefix
      continue;
    }
    if (/^\d{6,}$/.test(w) || /^\d+x\d+$/i.test(w) || /^(dsc|img|pxl|mvimg)\d+$/i.test(w)) continue; // timestamps, sizes, DSC01234
    words.push(w);
  }
  // what's left must contain a real word, not just numbers or a stray "at"
  if (!words.some((w) => /\p{L}{3,}/u.test(w))) return "";
  const text = words.join(" ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Everything that holds a picture as { src, alt }: gallery photos, cover images, the homepage photos. */
export function imageItems(data: Obj): Obj[] {
  const out: Obj[] = [];
  const add = (g: unknown) => Array.isArray(g) && out.push(...g);
  for (const t of data.teams || []) {
    if (t.cover) out.push(t.cover);
    for (const c of t.campaigns || []) add(c.gallery);
  }
  for (const a of data.achievements || []) {
    if (a.cover) out.push(a.cover);
    add(a.gallery);
  }
  if (data.site?.cover) out.push(data.site.cover);
  add(data.site?.homeGallery?.images);
  return out.filter((x) => x && typeof x === "object");
}

/** On load: descriptions already written next to images become the library's descriptions (first one wins). */
export function seedDescriptions(data: Obj): void {
  const lib: Obj = (data.mediaDescriptions ||= {});
  for (const item of imageItems(data)) {
    if (item.src && typeof item.alt === "string" && item.alt.trim() && !(item.src in lib)) lib[item.src] = item.alt.trim();
  }
}

/** Make every gallery item show its image's library description. */
export function syncAlts(data: Obj): void {
  const lib: Obj = data.mediaDescriptions || {};
  for (const item of imageItems(data)) if (item.src && item.src in lib) item.alt = lib[item.src];
}

/** What gets written to src/data/media.ts: sorted by path, trimmed, empty ones left out. */
export function mediaValues(data: Obj): Obj {
  const lib: Obj = data.mediaDescriptions || {};
  return Object.fromEntries(
    Object.keys(lib)
      .filter((k) => typeof lib[k] === "string" && lib[k].trim())
      .sort()
      .map((k) => [k, lib[k].trim()]),
  );
}
