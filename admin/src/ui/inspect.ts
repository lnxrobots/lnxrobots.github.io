/**
 * Works out which piece of data a clicked/hovered element on the website comes from.
 *
 * The site's preview can't tell us "this is team 2's tagline" — it only knows the element's
 * text, image address or link. So we index every value in the data and match on those.
 * Pure functions (no DOM, no React) so they're easy to test.
 */
import type { Obj } from "./util";

export interface Cand {
  tag: string;
  text: string;
  src?: string;
  href?: string;
  rank?: number;
  total?: number;
}

export interface Entry {
  kind: "text" | "img" | "href" | "record";
  value: string; // what the site shows (as last saved)
  norm: string;
  obj: Obj; // the data object that holds it
  key: string;
  chain: Obj[]; // ancestors — opened so the field is visible
  labels: string[]; // a readable name for each object in `chain`
  route: string; // editor route, e.g. #/teams/team-1
  label: string; // human-readable location
}

export interface Resolved {
  entry: Entry;
  alternatives: Entry[];
  /** index into the candidate list that matched (which element to outline) */
  candIndex: number;
  /** matched a whole block (card/section) rather than one field */
  container: boolean;
}

export const norm = (s: string): string => s.replace(/\s+/g, " ").trim().toLowerCase();
/** Words only, padded with spaces, so "season" doesn't match inside "seasons". */
const fold = (s: string): string => ` ${s.replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;

/** Keys that are internal or never shown verbatim on the site. */
const SKIP_KEYS = new Set(["id", "slug", "tier", "kind", "status", "discipline", "team", "date", "start", "end", "since", "year", "active", "googleVerification"]);
const IMG_KEYS = new Set(["photo", "logo", "src"]);
const HREF_KEYS = new Set(["url", "href", "codeRepo", "hardwareRepo", "resultsUrl", "github", "youtube", "instagram", "email"]);

const KEY_LABEL: Record<string, string> = {
  name: "Name", role: "Role", bio: "Note", tagline: "Tagline", summary: "Summary", event: "Competition name", location: "Location",
  label: "Text", value: "Value", title: "Title", alt: "Photo description", note: "Note", photo: "Photo", logo: "Logo", src: "Photo",
  shortName: "Short name", org: "Organisation", designation: "Badge text", shortTagline: "Short tagline", longTagline: "Long tagline",
  years: "Years", fundingNote: "Funding note", url: "Website", href: "Link", email: "Email", id: "Video", text: "Text",
};

const titleOf = (o: Obj): string => {
  const t = String(o.name || o.event || o.title || o.shortName || o.label || o.id || o.slug || o.alt || "").trim();
  return t.length > 40 ? `${t.slice(0, 38)}…` : t;
};

/** Names for nested objects/lists that have no title of their own. */
const NESTED_LABEL: Record<string, string> = {
  cover: "Cover image", homeGallery: "Home page photos", gallery: "Photos", images: "Photos", social: "Social links",
  nextEvent: "Next event", videos: "Videos", results: "Results", specs: "Specs", docs: "Documents",
};

/** Replace {{team:slug}} with the team's name, the way the site renders it. */
function display(s: string, teamName: (slug: string) => string): string {
  return s.replace(/\{\{team:([^}]+)\}\}/g, (_m, slug) => teamName(slug));
}

/**
 * Index every editable value. Objects may carry `_s` — a copy of their values as last saved —
 * because the page shows saved data, not what's currently being typed.
 */
export function buildIndex(data: Obj): Entry[] {
  const out: Entry[] = [];
  const teamName = (slug: string) => String((data.teams || []).find((t: Obj) => t.slug === slug)?.name ?? slug);

  interface Ctx { route: string; chain: Obj[]; labels: string[]; prefix: string[]; parentKey: string; isItem: boolean; root: boolean }
  const walk = (node: unknown, c: Ctx): void => {
    if (Array.isArray(node)) return node.forEach((n) => walk(n, { ...c, isItem: true }));
    if (!node || typeof node !== "object") return;
    const o = node as Obj;
    const nested = NESTED_LABEL[c.parentKey] || "";
    const own = c.root ? "" : c.isItem ? titleOf(o) || nested : nested || titleOf(o);
    const chain = [...c.chain, o];
    const labels = [...c.labels, own];
    for (const [key, raw] of Object.entries(o)) {
      if (key.startsWith("_")) continue;
      const saved = o._s && key in o._s ? o._s[key] : raw;
      if (typeof saved === "string" && !SKIP_KEYS.has(key)) {
        const v = saved.trim();
        if (v.length < 2) continue;
        const kind: Entry["kind"] = IMG_KEYS.has(key) || (v.startsWith("/content/") && /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(v)) ? "img" : HREF_KEYS.has(key) ? "href" : "text";
        const shown = kind === "text" ? display(v, teamName) : v;
        out.push({
          kind, value: shown, norm: kind === "text" ? norm(shown) : shown, obj: o, key, chain, labels, route: c.route,
          label: [...c.prefix, ...labels.filter(Boolean), KEY_LABEL[key] || key].join(" › "),
        });
      } else if (raw && typeof raw === "object") walk(raw, { ...c, chain, labels, parentKey: key, isItem: false, root: false });
    }
  };
  const start = (route: string, prefix: string[], root = false): Ctx => ({ route, chain: [], labels: [], prefix, parentKey: "", isItem: false, root });

  walk(data.site, start("#/site", ["Site"], true));
  for (const t of data.teams || []) {
    walk(t, start(`#/teams/${t._k}`, []));
    // the whole team card / page links to /team/<slug>: that means "edit this team"
    out.push({ kind: "record", value: `/team/${t.slug}`, norm: `/team/${t.slug}`, obj: t, key: "", chain: [t], labels: [titleOf(t)], route: `#/teams/${t._k}`, label: `Team “${titleOf(t)}”` });
  }
  for (const a of data.achievements || []) {
    walk(a, start(`#/results/${a._k}`, []));
    out.push({ kind: "record", value: `/event/${a.id}`, norm: `/event/${a.id}`, obj: a, key: "", chain: [a], labels: [titleOf(a)], route: `#/results/${a._k}`, label: `Result “${titleOf(a)}”` });
  }
  walk(data.sponsors, start("#/sponsors", ["Sponsors"]));
  walk(data.disciplines, start("#/competitions", ["Competitions"]));
  if (typeof data.fundingNote === "string" && data.fundingNote.trim().length > 1) {
    out.push({ kind: "text", value: data.fundingNote, norm: norm(data.fundingNote), obj: data, key: "fundingNote", chain: [], labels: [], route: "#/sponsors", label: "Sponsors › Funding note" });
  }
  return out;
}

/** The path part of an image URL, undoing Next's /_next/image?url=… wrapper. */
export function imgPath(src: string): string {
  try {
    const u = new URL(src, "http://x");
    if (u.pathname === "/_next/image") return decodeURIComponent(u.searchParams.get("url") || "");
    return decodeURIComponent(u.pathname);
  } catch {
    return src;
  }
}

function choose(hits: Entry[], c: Cand, pageRoute: string | null): { entry: Entry; alternatives: Entry[] } {
  // Prefer entries belonging to the page being shown (e.g. the team whose page this is).
  const onPage = pageRoute ? hits.filter((h) => h.route === pageRoute) : [];
  let pool = onPage.length ? onPage : hits;
  // Same words in a badge and a heading (a team's "Team 1" designation and name): a heading shows the name.
  if (/^h[1-4]$/.test(c.tag)) {
    const headings = pool.filter((h) => h.key === "name" || h.key === "event" || h.key === "title");
    if (headings.length) pool = headings;
  }
  // Repeated labels (several "Software" roles): the Nth on the page is usually the Nth in the data.
  let entry = pool[0];
  if (c.rank !== undefined && c.total === pool.length && pool[c.rank]) entry = pool[c.rank];
  return { entry, alternatives: hits.filter((h) => h !== entry) };
}

/** What kind of thing a record is, for ranking and for its label. */
const priority = (route: string): number => (route.startsWith("#/teams") || route.startsWith("#/results") ? 3 : route === "#/sponsors" ? 2 : 1);
const kindWord = (route: string): string => (route.startsWith("#/teams") ? "Team" : route.startsWith("#/results") ? "Result" : route === "#/sponsors" ? "Sponsor" : route === "#/competitions" ? "Competition" : "Site");

/**
 * A block (card, section) holding several known strings means "this record" — the smallest
 * record that contains them all: a member card → that member; a team card → that team.
 */
function blockRecord(inside: Entry[], pageRoute: string | null): Entry | null {
  const byRecord = new Map<Obj, Entry[]>();
  for (const e of inside) byRecord.set(e.chain[0] ?? e.obj, [...(byRecord.get(e.chain[0] ?? e.obj) || []), e]);
  const groups = [...byRecord.values()];
  // Two teams/results inside one block (a whole list, a section) isn't "a record" — unless one clearly dominates.
  const total = (g: Entry[]) => g.reduce((n, e) => n + e.norm.length, 0);
  const strong = groups.filter((g) => priority(g[0].route) === 3).sort((a, b) => total(b) - total(a));
  const onPage = pageRoute ? strong.find((g) => g[0].route === pageRoute) : undefined;
  if (strong.length > 1 && !onPage && total(strong[0]) < 2 * total(strong[1])) return null;
  const score = (g: Entry[]) => priority(g[0].route) * 1e6 + g.length * 1e3 + total(g);
  const best = onPage ?? (strong.length ? strong[0] : [...groups].sort((a, b) => score(b) - score(a))[0]);
  if (!best) return null;
  // deepest object shared by every contained string
  let k = best[0].chain.length;
  for (const e of best) {
    let i = 0;
    while (i < k && i < e.chain.length && e.chain[i] === best[0].chain[i]) i++;
    k = i;
  }
  if (k < 1) return null;
  const first = best[0];
  const head = kindWord(first.route) === "Site" ? "Site" : `${kindWord(first.route)} “${first.labels[0] || ""}”`;
  const label = [head, ...first.labels.slice(1, k).filter(Boolean)].join(" › ");
  return { ...first, kind: "record", value: "", norm: "", obj: first.chain[k - 1], key: "", chain: first.chain.slice(0, k), labels: first.labels.slice(0, k), label };
}

/**
 * Finds the data behind an element. `cands` runs from the element under the mouse outward
 * through its parents; the first one that matches wins, so clicking text edits that text,
 * and clicking a card's padding opens that card's record.
 */
export function resolve(index: Entry[], cands: Cand[], pageRoute: string | null): Resolved | null {
  for (let i = 0; i < cands.length; i++) {
    const c = cands[i];
    if (c.src) {
      const p = imgPath(c.src);
      const hits = index.filter((e) => e.kind === "img" && e.value === p);
      if (hits.length) return { ...choose(hits, { ...c, rank: undefined }, pageRoute), candIndex: i, container: false };
    }
    const t = norm(c.text);
    if (t) {
      const exact = index.filter((e) => e.kind === "text" && e.norm === t);
      if (exact.length) return { ...choose(exact, c, pageRoute), candIndex: i, container: false };
    }
    if (c.href) {
      const h = c.href.split(/[?#]/)[0].replace(/\/$/, "");
      // a link to /team/<slug> or /event/<id> is that team's / result's card
      const rec = index.find((e) => e.kind === "record" && e.value === h);
      if (rec) return { entry: rec, alternatives: [], candIndex: i, container: true };
      const hits = index.filter((e) => e.kind === "href" && (e.value === c.href || e.value.replace(/\/$/, "") === h || e.value === `mailto:${c.href}`));
      if (hits.length) return { ...choose(hits, c, pageRoute), candIndex: i, container: false };
    }
    if (i < 4 && t.length >= 6 && t.length <= 500) {
      const ft = fold(t);
      let inside = index.filter((e) => e.kind === "text" && e.norm.length >= 5 && ft.includes(fold(e.norm)));
      // ignore strings that are just a fragment of a longer matched string ("LNX Robots" inside a tagline)
      inside = inside.filter((e) => !inside.some((o) => o !== e && o.norm.length > e.norm.length && fold(o.norm).includes(fold(e.norm))));
      const rec = inside.length ? blockRecord(inside, pageRoute) : null;
      if (rec) return { entry: rec, alternatives: [], candIndex: i, container: true };
    }
  }
  return null;
}

/* ───────── page ⇄ editor route ───────── */

/** Editor route for a website path, e.g. /team/team-1 → #/teams/<key>. */
export function routeForPath(data: Obj, path: string): string | null {
  const seg = path.split("?")[0].split("/").filter(Boolean).map(decodeURIComponent);
  if (!seg.length) return "#/site";
  if (seg[0] === "team" && seg[1]) {
    const t = (data.teams || []).find((x: Obj) => x.slug === seg[1]);
    return t ? `#/teams/${t._k}` : "#/teams";
  }
  if (seg[0] === "event" && seg[1]) {
    const a = (data.achievements || []).find((x: Obj) => x.id === seg[1]);
    return a ? `#/results/${a._k}` : "#/results";
  }
  if (seg[0] === "teams" || seg[0] === "docs") return "#/teams";
  if (seg[0] === "achievements" || seg[0] === "gallery") return "#/results";
  return null;
}

/** Website path to show for an editor route (so the preview follows the panel). */
export function pathForRoute(data: Obj, hash: string): string | null {
  const [name, key] = hash.replace(/^#\//, "").split("/");
  if (name === "teams") {
    const t = key && (data.teams || []).find((x: Obj) => x._k === key);
    return t && t.slug ? `/team/${t.slug}` : "/teams";
  }
  if (name === "results") {
    const a = key && (data.achievements || []).find((x: Obj) => x._k === key);
    return a && a.id ? `/event/${a.id}` : "/achievements";
  }
  if (name === "site") return "/";
  if (name === "sponsors") return "/";
  if (name === "competitions") return "/achievements";
  return null;
}

/** All pages that can be previewed, for the page picker. */
export function listPages(data: Obj): { path: string; label: string }[] {
  return [
    { path: "/", label: "Home" },
    { path: "/teams", label: "Teams" },
    ...(data.teams || []).filter((t: Obj) => t.slug).map((t: Obj) => ({ path: `/team/${t.slug}`, label: `Team · ${t.name || t.slug}` })),
    { path: "/achievements", label: "Achievements" },
    { path: "/gallery", label: "Gallery" },
    ...(data.achievements || []).filter((a: Obj) => a.id).map((a: Obj) => ({ path: `/event/${a.id}`, label: `Event · ${a.event || a.id}` })),
    { path: "/docs", label: "Documents" },
    { path: "/about", label: "About" },
  ];
}
