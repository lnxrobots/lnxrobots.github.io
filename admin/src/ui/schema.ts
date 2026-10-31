/* State, field schemas, normalisation (what gets written) and validation. */

import { mediaValues, seedDescriptions, syncAlts } from "./descriptions";
import { api, isUrl, rid, slugify, SLUG, toArr, thisYear, type Obj } from "./util";

export interface Option { value: string; label: string }
export type Ctx = Obj; // { team?, achievement?, item? }
export type FieldType = "cover" | "text" | "textarea" | "url" | "number" | "slug" | "select" | "multi" | "bool" | "date" | "eventdate" | "image" | "file" | "list" | "gallery" | "videos" | "group";
export interface Field {
  key: string; label: string; type: FieldType;
  required?: boolean | "warn"; optional?: boolean; w?: "full"; placeholder?: string; help?: string; advanced?: boolean;
  single?: boolean; layout?: "rows" | "cards" | "collapse"; item?: Field[]; fields?: Field[];
  options?: () => Option[]; dir?: (c: Ctx) => string; auto?: (o: Obj, c: Ctx) => string;
  title?: (o: Obj) => string; badge?: (o: Obj) => string | undefined; template?: (c: Ctx) => Obj;
  addLabel?: string; addTop?: boolean; empty?: string; confirmRemove?: boolean; canRemove?: (o: Obj) => string;
}
export interface MediaFile { path: string; size: number; mtime: number; ext: string }
export interface Issue { level: "error" | "warn"; where: string; msg: string; route: string }

export const S: {
  data: Obj; versions: Record<string, string>; snap: Record<string, string>;
  media: MediaFile[]; meta: { siteUrl?: string; hasPublic?: boolean }; shrink: boolean;
} = { data: {}, versions: {}, snap: {}, media: [], meta: {}, shrink: true };

export const DATASETS = ['site', 'teams', 'achievements', 'sponsors', 'disciplines', 'media'];
/** Which nav item shows the "unsaved" dot for which dataset. */
export const NAV_DATASETS: Record<string, string[]> = { site: ['site'], teams: ['teams'], results: ['achievements'], sponsors: ['sponsors'], competitions: ['disciplines'], media: ['media'] };

/* ───────── option lists ───────── */

export const STATUS_OPTS: Option[] = [
  { value: 'competing', label: 'Competing' },
  { value: 'in-development', label: 'In development' },
  { value: 'retired', label: 'Retired' },
];
export const TIER_OPTS: Option[] = [
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'special', label: 'Special award' },
  { value: 'note', label: 'Note (no medal)' },
];
export const KIND_OPTS: Option[] = [
  { value: 'poster', label: 'Poster' },
  { value: 'tdp', label: 'Team description paper' },
  { value: 'design-doc', label: 'Design document' },
  { value: 'schematic', label: 'Schematic' },
  { value: 'archive', label: 'Archive / release' },
  { value: 'other', label: 'Other' },
];
export const disciplineOpts = (): Option[] => S.data.disciplines.map((d: Obj) => ({ value: d.slug, label: d.shortName || d.name || d.slug }));
export const teamOpts = (): Option[] => S.data.teams.map((t: Obj) => ({ value: t.slug, label: t.name || t.slug }));
export const disciplineName = (slug: string): string => (S.data.disciplines.find((d: Obj) => d.slug === slug) || {}).shortName || slug || '';
export const teamName = (slug: string): string => (S.data.teams.find((t: Obj) => t.slug === slug) || {}).name || slug || '';

/* ───────── field schemas ─────────
 * type: text | textarea | url | number | slug | select | multi | bool | date |
 *       eventdate | image | file | list | gallery | videos | group
 * required: true → blocks saving when empty; 'warn' → just a warning
 * optional: true → the key is left out of the file when empty
 * Key order here is the order new keys are written in.                      */

export const F: Record<string, Field[]> = {};

F.person = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'role', label: 'Role', type: 'text', required: true, placeholder: 'Software, Hardware & electronics, Mentor…' },
  { key: 'photo', label: 'Photo', type: 'image', optional: true, dir: (c: Ctx) => `${c.team.slug}/members`, help: 'Optional. Without a photo the site shows an initials tile.' },
  { key: 'bio', label: 'Note', type: 'text', optional: true, w: 'full', placeholder: 'Years on the team, or a one-line bio' },
];

F.spec = [
  { key: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Main processing unit' },
  { key: 'value', label: 'Value', type: 'text', required: true, placeholder: 'Raspberry Pi 5' },
];

F.doc = [
  { key: 'title', label: 'Title', type: 'text', required: true, w: 'full', placeholder: 'Poster — RoboCup 2027, Nuremberg' },
  {
    key: 'href', label: 'File or link', type: 'file', required: true,
    dir: (c: Ctx) => `${c.team.slug}/docs/${c.item.year || thisYear()}`,
    help: 'Upload a PDF or ZIP, or paste a link (for example a GitHub release).',
  },
  { key: 'kind', label: 'Type', type: 'select', required: true, options: () => KIND_OPTS },
  { key: 'year', label: 'Year', type: 'number', required: true },
];

F.galleryItem = [
  { key: 'src', label: 'Photo', type: 'text', required: true },
  { key: 'alt', label: 'Description', type: 'text', required: 'warn' },
];

F.video = [
  { key: 'id', label: 'YouTube link', type: 'text', required: true },
  { key: 'title', label: 'Title', type: 'text', required: true },
];

F.result = [
  { key: 'label', label: 'Result', type: 'text', required: true, placeholder: '1st place, Junior Soccer Open' },
  { key: 'tier', label: 'Badge', type: 'select', required: true, options: () => TIER_OPTS },
];

F.campaign = [
  {
    key: 'id', label: 'Entry id', type: 'slug', required: true,
    auto: (o: Obj, c: Ctx) => `${c.team.slug}-${o.discipline || 'entry'}-${String(o.years || '').replace(/[^0-9]+/g, '-')}`,
    help: 'Internal id. Fixed once saved.',
  },
  { key: 'discipline', label: 'Competition', type: 'select', required: true, options: disciplineOpts },
  { key: 'years', label: 'Years', type: 'text', required: true, placeholder: '2027  or  2025 - 2026' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: () => STATUS_OPTS },
  { key: 'tagline', label: 'Tagline', type: 'text', w: 'full', placeholder: 'One line describing this build' },
  { key: 'summary', label: 'Summary', type: 'textarea' },
  { key: 'specs', label: 'Robot specs', type: 'list', layout: 'rows', item: F.spec, addLabel: 'Add spec', empty: 'No specs listed.', template: () => ({ label: '', value: '' }) },
  { key: 'codeRepo', label: 'Code repository', type: 'url', optional: true, placeholder: 'https://github.com/lnxrobots/…' },
  { key: 'hardwareRepo', label: 'Hardware repository', type: 'url', optional: true, placeholder: 'https://github.com/lnxrobots/…' },
  {
    key: 'docs', label: 'Documents', type: 'list', layout: 'cards', item: F.doc, addLabel: 'Add document', empty: 'No documents yet.',
    title: (d: Obj) => d.title || 'New document', confirmRemove: true,
    template: () => ({ title: '', href: '', kind: 'poster', year: thisYear() }),
  },
  { key: 'gallery', label: 'Photos', type: 'gallery', dir: (c: Ctx) => `${c.team.slug}/images` },
];

F.team = [
  { key: 'slug', label: 'Address name (slug)', type: 'slug', required: true, auto: (o: Obj) => o.designation || o.name, help: 'Used in the page address, /team/<slug>. Fixed once saved.' },
  { key: 'designation', label: 'Badge text', type: 'text', required: true, placeholder: 'Team 3' },
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'since', label: 'Founded (year)', type: 'text', required: true },
  { key: 'active', label: 'Currently active', type: 'bool' },
  { key: 'tagline', label: 'Tagline', type: 'text', w: 'full' },
  { key: 'summary', label: 'Summary', type: 'textarea' },
  { key: 'cover', label: 'Cover image', type: 'cover', optional: true, dir: (c: Ctx) => `${c.team.slug}/images`, help: 'Shown at the top of the team’s card and page. Without one, the card has no picture.' },
  {
    key: 'members', label: 'Members', type: 'list', layout: 'cards', item: F.person, addLabel: 'Add member', empty: 'No members yet.',
    title: (p: Obj) => p.name || 'New member', confirmRemove: true, template: () => ({ name: '', role: '' }),
  },
  {
    key: 'mentors', label: 'Mentors', type: 'list', layout: 'cards', item: F.person, addLabel: 'Add mentor', empty: 'No mentors yet.',
    title: (p: Obj) => p.name || 'New mentor', confirmRemove: true, template: () => ({ name: '', role: 'Mentor' }),
  },
  {
    key: 'campaigns', label: 'Competition entries', type: 'list', layout: 'collapse', item: F.campaign, addLabel: 'Add competition entry', addTop: true,
    empty: 'This team has no competition entries yet.', confirmRemove: true,
    title: (c: Obj) => [disciplineName(c.discipline), c.years].filter(Boolean).join(' · ') || 'New entry',
    badge: (c: Obj) => (STATUS_OPTS.find((s) => s.value === c.status) || {}).label,
    template: () => ({ id: '', discipline: '', years: String(thisYear()), status: 'in-development', tagline: '', summary: '', specs: [], docs: [], gallery: [], _new: true, _open: true }),
  },
];

F.achievement = [
  {
    key: 'id', label: 'Address name (id)', type: 'slug', required: true,
    auto: (o: Obj) => `${String(o.date || '').slice(0, 4)}-${slugify(String(o.location || '').split(',')[0])}`,
    help: 'Used in the page address, /event/<id>. Fixed once saved.',
  },
  { key: 'event', label: 'Competition name', type: 'text', required: true, w: 'full', placeholder: 'RoboCup World Championship' },
  { key: 'location', label: 'Location', type: 'text', required: true, placeholder: 'Nuremberg, Germany' },
  { key: 'date', label: 'Date (first day)', type: 'date', required: true },
  { key: 'discipline', label: 'League(s)', type: 'multi', required: true, single: true, options: disciplineOpts, help: 'Choose every league this result belongs to.' },
  { key: 'team', label: 'Team(s)', type: 'multi', required: true, single: true, options: teamOpts },
  {
    key: 'results', label: 'Results', type: 'list', layout: 'rows', item: F.result, addLabel: 'Add result', empty: 'No results listed.',
    template: () => ({ label: '', tier: 'gold' }),
    help: 'Tip: write {{team:team-1}} to insert that team’s current name.',
  },
  { key: 'resultsUrl', label: 'Standings link', type: 'url', optional: true, placeholder: 'https://…' },
  { key: 'cover', label: 'Cover image', type: 'cover', optional: true, dir: (c: Ctx) => `events/${c.achievement.id}`, help: 'Shown on the homepage, the timeline and at the top of the event page. Without one, the first photo below is used.' },
  { key: 'videos', label: 'Videos', type: 'videos', optional: true },
  { key: 'gallery', label: 'Photos', type: 'gallery', optional: true, dir: (c: Ctx) => `events/${c.achievement.id}` },
];

F.sponsor = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'url', label: 'Website', type: 'url', required: true, placeholder: 'https://…' },
  { key: 'note', label: 'Note', type: 'text', optional: true, w: 'full' },
  { key: 'logo', label: 'Logo', type: 'image', optional: true, dir: () => 'sponsors', help: 'SVG or PNG with a transparent background works best on the dark site.' },
];

F.discipline = [
  { key: 'slug', label: 'Slug', type: 'slug', required: true, auto: (o: Obj) => o.shortName || o.name, help: 'Internal id. Fixed once saved.' },
  { key: 'name', label: 'Full name', type: 'text', required: true, placeholder: 'RoboCupJunior Soccer — Open' },
  { key: 'shortName', label: 'Short name', type: 'text', required: true, placeholder: 'Soccer Open' },
  { key: 'org', label: 'Organisation', type: 'text', required: true, placeholder: 'RoboCupJunior' },
  { key: 'url', label: 'Website', type: 'url', optional: true, placeholder: 'https://…' },
];

F.site = [
  { key: 'name', label: 'Club name', type: 'text', required: true },
  { key: 'designation', label: 'Short name', type: 'text', required: true },
  { key: 'shortTagline', label: 'Short tagline', type: 'text', required: true, w: 'full' },
  { key: 'longTagline', label: 'Long tagline', type: 'textarea', required: true },
  { key: 'email', label: 'Contact email', type: 'text', required: true },
  { key: 'location', label: 'Location', type: 'text', required: true },
  {
    key: 'social', label: 'Social links', type: 'group',
    fields: [
      { key: 'github', label: 'GitHub', type: 'url', required: true },
      { key: 'youtube', label: 'YouTube', type: 'url', required: true },
      { key: 'instagram', label: 'Instagram', type: 'url', required: true },
    ],
  },
  {
    key: 'nextEvent', label: 'Next event (homepage countdown)', type: 'group',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, w: 'full' },
      { key: 'location', label: 'Location', type: 'text', required: true },
      { key: 'href', label: 'Event website', type: 'url', required: true },
      { key: 'start', label: 'First day', type: 'eventdate', required: true },
      { key: 'end', label: 'Last day', type: 'eventdate', required: true },
    ],
  },
  { key: 'cover', label: 'Cover image', type: 'cover', optional: true, dir: () => 'site', help: 'The big picture beside the headline on the homepage (large screens). Square pictures work best.' },
  {
    key: 'homeGallery', label: 'Homepage photos', type: 'group', optional: true,
    fields: [
      { key: 'title', label: 'Heading', type: 'text', required: true },
      { key: 'text', label: 'Text under the heading', type: 'textarea' },
      { key: 'images', label: 'Photos', type: 'gallery', dir: () => 'home' },
    ],
  },
  { key: 'googleVerification', label: 'Google Search Console verification code', type: 'text', advanced: true },
];

/* ───────── normalisation: what actually gets written ───────── */

const itemSchema = (f: Field): Field[] => (f.type === 'list' ? f.item! : f.type === 'gallery' ? F.galleryItem : F.video);

function normField(v: unknown, f: Field): unknown {
  switch (f.type) {
    case 'list':
    case 'gallery':
    case 'videos': {
      const items = (Array.isArray(v) ? v : []).map((it: Obj) => normObj(it, itemSchema(f)));
      return !items.length && f.optional ? undefined : items;
    }
    case 'group': {
      const out = normObj((v as Obj) || {}, f.fields!);
      const empty = Object.values(out).every((x) => (Array.isArray(x) ? !x.length : x === '' || x === undefined));
      return f.optional && empty ? undefined : out;
    }
    case 'cover': {
      const c = (v as Obj) || {};
      const src = String(c.src ?? '').trim();
      return src ? { src, alt: String(c.alt ?? '').trim() } : undefined;
    }
    case 'bool':
      return !!v;
    case 'multi': {
      const arr = toArr(v).filter(Boolean);
      if (!arr.length) return f.optional ? undefined : f.single ? '' : [];
      return f.single && arr.length === 1 ? arr[0] : arr;
    }
    case 'number': {
      if (v === '' || v === null || v === undefined) return f.optional ? undefined : '';
      return Number.isFinite(Number(v)) ? Number(v) : '';
    }
    default: {
      const s = String(v ?? '').trim();
      return s === '' && f.optional ? undefined : s;
    }
  }
}

export function normObj(obj: Obj, fields: Field[]): Obj {
  const out: Obj = {};
  const known = new Set(fields.map((f) => f.key));
  for (const f of fields) {
    if (!(f.key in obj) && f.optional) continue;
    const v = normField(obj[f.key], f);
    if (v !== undefined) out[f.key] = v;
  }
  // keep any keys this editor doesn't know about, untouched
  for (const [k, v] of Object.entries(obj)) if (!known.has(k) && !k.startsWith('_')) out[k] = v;
  return out;
}

/** Newest first — the homepage shows the first item as "latest result". */
export const sortedAchievements = (): Obj[] => [...S.data.achievements].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

export function datasetValues(ds: string): Obj {
  const d = S.data;
  switch (ds) {
    default: return {};
    case 'site': return { site: normObj(d.site, F.site) };
    case 'teams': return { teams: d.teams.map((t: Obj) => normObj(t, F.team)) };
    case 'achievements': return { achievements: sortedAchievements().map((a) => normObj(a, F.achievement)) };
    case 'sponsors': return { sponsors: d.sponsors.map((s: Obj) => normObj(s, F.sponsor)), fundingNote: String(d.fundingNote || '').trim() };
    case 'disciplines': return { disciplines: d.disciplines.map((x: Obj) => normObj(x, F.discipline)) };
    case 'media': return { mediaDescriptions: mediaValues(d) };
  }
}

export const snapshot = (ds: string) => JSON.stringify(datasetValues(ds));
export const dirtyDatasets = (): string[] => DATASETS.filter((ds) => snapshot(ds) !== S.snap[ds]);

/* ───────── keys & loading ───────── */

/** Every entity gets a stable internal key for routing; new ones get a random one. */
function assignKeys() {
  const d = S.data;
  const key = (o: Obj, field: string) => (o._k = o._k || o[field] || `new-${rid()}`);
  d.teams.forEach((t: Obj) => key(t, 'slug'));
  d.achievements.forEach((a: Obj) => key(a, 'id'));
  d.disciplines.forEach((x: Obj) => key(x, 'slug'));
}

/** Remember each object's text as last saved: the preview shows saved data, not what's being typed. */
export function markSaved(node: unknown): void {
  if (Array.isArray(node)) return node.forEach(markSaved);
  if (!node || typeof node !== "object") return;
  const o = node as Obj;
  const saved: Obj = {};
  for (const [k, v] of Object.entries(o)) if (!k.startsWith("_") && typeof v === "string") saved[k] = v;
  o._s = saved;
  for (const [k, v] of Object.entries(o)) if (!k.startsWith("_") && k !== "mediaDescriptions") markSaved(v);
}

export async function loadAll() {
  const { data, versions } = await api<{ data: Obj; versions: Record<string, string> }>('/api/data');
  S.data = data;
  S.versions = versions;
  assignKeys();
  seedDescriptions(S.data); // descriptions already typed into galleries become the library's
  syncAlts(S.data);
  markSaved(S.data);
  for (const ds of DATASETS) S.snap[ds] = snapshot(ds);
}

export async function loadMedia() {
  S.media = (await api<{ files: MediaFile[] }>('/api/media')).files;
}

/** After a save, items are no longer "new" (their ids become read-only). */
export function clearNewFlags(node: unknown): void {
  if (Array.isArray(node)) node.forEach(clearNewFlags);
  else if (node && typeof node === 'object') {
    const o = node as Obj;
    delete o._new;
    delete o._idTouched;
    Object.values(o).forEach(clearNewFlags);
  }
}

/* ───────── validation ───────── */

const isEmpty = (v: unknown, f: Field) => (f.type === 'multi' ? !toArr(v).length : f.type === 'number' ? v === '' || v === null || v === undefined : String(v ?? '').trim() === '');

export function validate(): Issue[] {
  const issues: Issue[] = [];
  const add = (level: Issue['level'], where: string, msg: string, route: string) => issues.push({ level, where, msg, route });
  const d = S.data;
  const teamSlugs = new Set<string>(d.teams.map((t: Obj) => t.slug));
  const discSlugs = new Set<string>(d.disciplines.map((x: Obj) => x.slug));

  const walk = (obj: Obj, fields: Field[], where: string, route: string) => {
    for (const f of fields) {
      const v = obj[f.key];
      if (f.type === 'list' || f.type === 'gallery' || f.type === 'videos') {
        const sub = itemSchema(f);
        ((v || []) as Obj[]).forEach((it, i) => {
          const name = (f.title && f.title(it)) || `${f.label} ${i + 1}`;
          walk(it, sub, `${where} › ${name}`, route);
        });
      } else if (f.type === 'group') {
        walk(v || {}, f.fields!, where, route);
      } else if (f.type === 'cover') {
        const c: Obj = v || {};
        const src = String(c.src ?? '').trim();
        if (src && !/^(\/|https?:\/\/)/.test(src)) add('error', where, `${f.label} must be an uploaded file or a full link.`, route);
        else if (src && !String(c.alt ?? '').trim()) add('warn', where, `${f.label}: the description is empty — screen readers need it.`, route);
      } else if (f.required && isEmpty(v, f)) {
        add(f.required === 'warn' ? 'warn' : 'error', where, f.required === 'warn' ? `${f.label} is empty — screen readers need it.` : `${f.label} is empty.`, route);
      } else if (f.type === 'slug' && v && !SLUG.test(v)) {
        add('error', where, `${f.label}: use only lowercase letters, numbers and dashes.`, route);
      } else if (f.type === 'url' && v && !isUrl(String(v).trim())) {
        add('error', where, `${f.label} must start with http:// or https://.`, route);
      } else if (f.type === 'file' && v && !/^(\/|https?:\/\/)/.test(String(v).trim())) {
        add('error', where, `${f.label} must be an uploaded file or a full link.`, route);
      }
    }
  };

  const dupes = (list: Obj[], key: string, label: string, where: (x: Obj) => string, route: (x: Obj) => string) => {
    const seen = new Set<string>();
    for (const x of list) {
      const k = x[key];
      if (k && seen.has(k)) add('error', where(x), `${label} “${k}” is used more than once.`, route(x));
      seen.add(k);
    }
  };

  d.teams.forEach((t: Obj) => {
    const route = `#/teams/${t._k}`;
    walk(t, F.team, `Team “${t.name || t.slug || 'new'}”`, route);
    t.campaigns.forEach((c: Obj) => {
      if (c.discipline && !discSlugs.has(c.discipline)) add('error', `Team “${t.name}” › ${c.id}`, `Unknown competition “${c.discipline}”.`, route);
    });
  });
  dupes(d.teams, 'slug', 'Team slug', (t: Obj) => `Team “${t.name}”`, (t: Obj) => `#/teams/${t._k}`);
  dupes(d.teams.flatMap((t: Obj) => t.campaigns.map((c: Obj) => ({ ...c, _t: t }))), 'id', 'Entry id', (c: Obj) => `Team “${c._t.name}”`, (c: Obj) => `#/teams/${c._t._k}`);

  d.achievements.forEach((a: Obj) => {
    const route = `#/results/${a._k}`;
    walk(a, F.achievement, `Result “${a.event || a.id || 'new'}”`, route);
    toArr(a.team).forEach((s) => s && !teamSlugs.has(s) && add('error', `Result “${a.event}”`, `Unknown team “${s}”.`, route));
    toArr(a.discipline).forEach((s) => s && !discSlugs.has(s) && add('error', `Result “${a.event}”`, `Unknown competition “${s}”.`, route));
    (a.results || []).forEach((r: Obj) => {
      for (const m of String(r.label || '').matchAll(/\{\{team:([^}]+)\}\}/g)) {
        if (!teamSlugs.has(m[1])) add('error', `Result “${a.event}”`, `“{{team:${m[1]}}}” doesn’t match any team.`, route);
      }
    });
  });
  dupes(d.achievements, 'id', 'Result id', (a: Obj) => `Result “${a.event}”`, (a: Obj) => `#/results/${a._k}`);

  d.sponsors.forEach((s: Obj) => walk(s, F.sponsor, `Sponsor “${s.name || 'new'}”`, '#/sponsors'));
  d.disciplines.forEach((x: Obj) => walk(x, F.discipline, `Competition “${x.shortName || x.name || 'new'}”`, '#/competitions'));
  dupes(d.disciplines, 'slug', 'Competition slug', (x: Obj) => `Competition “${x.name}”`, () => '#/competitions');
  walk(d.site, F.site, 'Site settings', '#/site');
  return issues;
}
