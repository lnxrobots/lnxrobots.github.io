"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { dirtyDatasets, F, loadMedia, S, sortedAchievements, teamName, type Field } from "./schema";
import { confirmDialog, edited, openLightbox, toast, uploadOne } from "./store";
import { describeFromFilename } from "./descriptions";
import { api, dirOf, extOf, fileName, fmtBytes, isImagePath, rid, thisYear, toArr, type Obj } from "./util";
import { FieldView, Fields, focusRef } from "./widgets";

export const go = (hash: string) => { location.hash = hash; };
const def = (list: Field[], key: string) => list.find((f) => f.key === key)!;
const pick = (list: Field[], keys: string[]) => list.filter((f) => keys.includes(f.key));

/** `focus`: when the preview selects this whole record, flash this panel. */
const Panel = ({ title, children, focus }: { title?: string; children?: ReactNode; focus?: Obj }) => (
  <section className="panel" ref={focus ? focusRef(focus, [""]) : undefined}>{title && <h2>{title}</h2>}{children}</section>
);
const Back = ({ to, label }: { to: string; label: string }) => <a className="back" href={to}>← {label}</a>;
const Lede = ({ children }: { children: ReactNode }) => <p className="lede">{children}</p>;
const NotFound = ({ what, back }: { what: string; back: string }) => (
  <div className="stack"><Back to={back} label="Back" /><Panel title={`That ${what} doesn’t exist`}><p>It may have been deleted, or the page was reloaded before it was saved.</p></Panel></div>
);

function fmtDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Things that still point at a team / competition, so it can't be deleted from under them. */
const blockers = {
  team: (slug: string) => S.data.achievements.filter((a: Obj) => toArr(a.team).includes(slug)).map((a: Obj) => a.event as string),
  discipline: (slug: string) => [
    ...S.data.achievements.filter((a: Obj) => toArr(a.discipline).includes(slug)).map((a: Obj) => `result “${a.event}”`),
    ...S.data.teams.flatMap((t: Obj) => t.campaigns.filter((c: Obj) => c.discipline === slug).map((c: Obj) => `${t.name}’s entry “${c.id}”`)),
  ] as string[],
};

export function titleFor(name: string, key?: string): string {
  switch (name) {
    case "site": return "Site and next event";
    case "teams": return key ? S.data.teams.find((t: Obj) => t._k === key)?.name || "Team" : "Teams";
    case "results": return key ? S.data.achievements.find((a: Obj) => a._k === key)?.event || "Result" : "Results and events";
    case "texts": return "Page texts";
    case "sponsors": return "Sponsors";
    case "competitions": return "Competitions";
    case "media": return "Media library";
    case "changes": return "Review changes";
    default: return "What would you like to update?";
  }
}

/* ───────── Home ───────── */

export function Home() {
  const Action = ({ title, text, onClick }: { title: string; text: string; onClick: () => void }) => (
    <button className="action" onClick={onClick}><strong>{title}</strong><span>{text}</span></button>
  );
  return (
    <div className="stack">
      <p className="lede">The website is on the right. <strong>Click any text or photo on it</strong> and the matching field opens here to edit. Switch to <em>Browse</em> (or Ctrl/⌘-click) to follow links. Or start from one of these:</p>
      <div className="actions">
        <Action title="Add a competition result" text="A new placement or award, with photos and video." onClick={addResult} />
        <Action title="Add photos or video to an event" text="Open an event, then drop images or paste a YouTube link." onClick={() => go("#/results")} />
        <Action title="Update the next event" text="The countdown on the homepage." onClick={() => go("#/site")} />
        <Action title="Add a team member" text="Name, role and photo." onClick={() => go("#/teams")} />
        <Action title="Add a poster or document" text="Upload a PDF to a team’s competition entry." onClick={() => go("#/teams")} />
        <Action title="Add a sponsor" text="Name, website and logo." onClick={() => go("#/sponsors")} />
      </div>
      <Panel title="How this works">
        <p>Edits are written into the website’s own files on this computer: text goes into <code>src/data</code> and uploads into <code>public/content</code>. Save to see them in the preview, or turn on <em>Live preview</em> to save as you type.</p>
        <p>Nothing is published or committed for you. When you’re done, open <a href="#/changes">Review changes</a>, then commit and push with git as usual.</p>
        <label className="check">
          <input type="checkbox" checked={S.shrink} onChange={(e) => { S.shrink = e.target.checked; localStorage.setItem("shrink", e.target.checked ? "1" : "0"); edited(); }} />
          Shrink large photos when uploading (max 2000 px wide — keeps the repository and the website fast)
        </label>
      </Panel>
    </div>
  );
}

/* ───────── Site settings ───────── */

export function SiteView() {
  const cover = def(F.site, "cover");
  const home = def(F.site, "homeGallery");
  const photos = (S.data.site.homeGallery ||= { title: "", text: "", images: [] });
  return (
    <div className="stack">
      <Panel focus={S.data.site}><Fields fields={F.site.filter((f) => !f.advanced && f.key !== "cover" && f.key !== "homeGallery")} obj={S.data.site} ctx={{}} /></Panel>
      <Panel title="Homepage cover image">
        <FieldView f={cover} obj={S.data.site} ctx={{}} bare />
        <p className="help">{cover.help}</p>
      </Panel>
      <Panel title="Homepage photos">
        <Lede>An extra photo section on the homepage, between the latest result and the teams. It is hidden while it has no photos.</Lede>
        <Fields fields={home.fields!} obj={photos} ctx={{}} />
      </Panel>
      <details className="advanced">
        <summary>Advanced</summary>
        <Fields fields={F.site.filter((f) => f.advanced)} obj={S.data.site} ctx={{}} />
        <p className="help">Leave this alone unless you are re-verifying the site with Google.</p>
      </details>
    </div>
  );
}

/* ───────── Page texts ───────── */

export function TextsView() {
  const home = def(F.copy, "home");
  const group = (S.data.copy ||= { home: {} }).home ||= {};
  return (
    <div className="stack">
      <Lede>Headlines, section labels and short paragraphs on the website’s pages. You can also click them on the page.</Lede>
      <Panel title="Homepage"><Fields fields={home.fields!} obj={group} ctx={{}} /></Panel>
    </div>
  );
}

/* ───────── Teams ───────── */

function addTeam() {
  const t = { slug: "", designation: "", name: "", since: String(thisYear()), active: true, tagline: "", summary: "", members: [], mentors: [], campaigns: [], _new: true, _k: `new-${rid()}` };
  S.data.teams.push(t);
  edited();
  go(`#/teams/${t._k}`);
}

export function TeamsView({ k }: { k?: string }) {
  if (k) return <TeamView k={k} />;
  return (
    <div className="stack">
      <Lede>A team is a group of students that stays together across seasons. Each team can enter several competitions.</Lede>
      <div className="cards">
        {S.data.teams.map((t: Obj) => (
          <a key={t._k} className="card-link" href={`#/teams/${t._k}`}>
            <div className="cl-head"><strong>{t.name || "New team"}</strong><span className={`badge ${t.active ? "ok" : ""}`}>{t.active ? "Active" : "Past"}</span></div>
            <p>{t.tagline || "—"}</p>
            <p className="meta">Since {t.since || "?"} · {t.members.length} member{t.members.length === 1 ? "" : "s"} · {t.campaigns.length} competition entr{t.campaigns.length === 1 ? "y" : "ies"}</p>
          </a>
        ))}
      </div>
      <div><button className="btn primary" onClick={addTeam}>Add team</button></div>
    </div>
  );
}

function TeamView({ k }: { k: string }) {
  const t: Obj | undefined = S.data.teams.find((x: Obj) => x._k === k);
  if (!t) return <NotFound what="team" back="#/teams" />;
  const ctx = { team: t };
  const bare = (key: string) => <FieldView f={def(F.team, key)} obj={t} ctx={ctx} bare />;
  return (
    <div className="stack">
      <Back to="#/teams" label="All teams" />
      <Panel title="Basics" focus={t}><Fields fields={pick(F.team, ["slug", "designation", "name", "since", "active", "tagline", "summary"])} obj={t} ctx={ctx} /></Panel>
      <Panel title="Cover image">{bare("cover")}<p className="help">{def(F.team, "cover").help}</p></Panel>
      <Panel title="Members">{bare("members")}</Panel>
      <Panel title="Mentors">{bare("mentors")}</Panel>
      <Panel title="Competition entries">
        <Lede>One entry per competition or league this team enters — each has its own robot specs, documents and photos.</Lede>
        {bare("campaigns")}
      </Panel>
      <Panel title="Delete this team">
        <p>Removes the team, its members and all its competition entries from the site. Uploaded files stay in public/content.</p>
        <button className="btn danger" onClick={() => deleteTeam(t)}>Delete team…</button>
      </Panel>
    </div>
  );
}

async function deleteTeam(t: Obj) {
  const used = blockers.team(t.slug);
  if (used.length) return void toast(`Can’t delete: these results belong to ${t.name}: ${used.join(", ")}. Delete or reassign them first.`, "error");
  if (!(await confirmDialog({ title: `Delete ${t.name || "this team"}?`, body: "This removes it from the site when you save.", ok: "Delete team", danger: true }))) return;
  S.data.teams = S.data.teams.filter((x: Obj) => x !== t);
  edited();
  go("#/teams");
}

/* ───────── Results ───────── */

export function addResult() {
  const n = new Date();
  const iso = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  const a = { id: "", event: "", location: "", date: iso, discipline: [], team: [], results: [], _new: true, _k: `new-${rid()}` };
  S.data.achievements.push(a);
  edited();
  go(`#/results/${a._k}`);
}

export function ResultsView({ k }: { k?: string }) {
  if (k) return <ResultView k={k} />;
  const years: Record<string, Obj[]> = {};
  for (const a of sortedAchievements()) (years[String(a.date || "").slice(0, 4) || "No date"] ||= []).push(a);
  return (
    <div className="stack">
      <div><button className="btn primary" onClick={addResult}>Add result</button></div>
      {Object.entries(years).sort(([a], [b]) => b.localeCompare(a)).map(([year, list]) => (
        <section className="year" key={year}>
          <h2>{year}</h2>
          {list.map((a) => (
            <a className="result-row" key={a._k} href={`#/results/${a._k}`}>
              <span className="rdate">{fmtDate(a.date)}</span>
              <span className="rmain">
                <strong>{a.event || "New result"}</strong>
                <span className="meta">{[a.location, toArr(a.team).map(teamName).join(", ")].filter(Boolean).join(" · ")}</span>
              </span>
              <span className="rchips">
                {(a.results || []).slice(0, 3).map((r: Obj, i: number) => (
                  <span key={i} className={`tier ${r.tier}`}>{String(r.label || "").replace(/\{\{team:([^}]+)\}\}/g, (_m, s) => teamName(s))}</span>
                ))}
                {(a.gallery || []).length > 0 && <span className="count">{a.gallery.length} photos</span>}
                {(a.videos || []).length > 0 && <span className="count">{a.videos.length} video{a.videos.length > 1 ? "s" : ""}</span>}
              </span>
            </a>
          ))}
        </section>
      ))}
    </div>
  );
}

function ResultView({ k }: { k: string }) {
  const a: Obj | undefined = S.data.achievements.find((x: Obj) => x._k === k);
  if (!a) return <NotFound what="result" back="#/results" />;
  const ctx = { achievement: a };
  const bare = (key: string) => <FieldView f={def(F.achievement, key)} obj={a} ctx={ctx} bare />;
  return (
    <div className="stack">
      <Back to="#/results" label="All results" />
      <Panel title="Event" focus={a}><Fields fields={pick(F.achievement, ["event", "location", "date", "id", "discipline", "team"])} obj={a} ctx={ctx} /></Panel>
      <Panel title="Cover image">{bare("cover")}<p className="help">{def(F.achievement, "cover").help}</p></Panel>
      <Panel title="What the team achieved">
        {bare("results")}
        <p className="help">{def(F.achievement, "results").help}</p>
        <Fields fields={pick(F.achievement, ["resultsUrl"])} obj={a} ctx={ctx} />
      </Panel>
      <Panel title="Videos">{bare("videos")}</Panel>
      <Panel title="Photos">
        <p className="help">Shown on this event’s page and in the gallery. Files are stored in public/content/events/ in a folder named after the event’s address name.</p>
        {bare("gallery")}
      </Panel>
      <Panel title="Delete this result">
        <p>Removes it from the timeline, gallery and homepage. Uploaded files stay in public/content.</p>
        <button className="btn danger" onClick={() => deleteResult(a)}>Delete result…</button>
      </Panel>
    </div>
  );
}

async function deleteResult(a: Obj) {
  if (!(await confirmDialog({ title: `Delete “${a.event || "this result"}”?`, body: "This removes it from the site when you save.", ok: "Delete result", danger: true }))) return;
  S.data.achievements = S.data.achievements.filter((x: Obj) => x !== a);
  edited();
  go("#/results");
}

/* ───────── Sponsors & competitions ───────── */

const SPONSOR_LIST: Field = {
  key: "sponsors", label: "Sponsors", type: "list", layout: "cards", item: F.sponsor, addLabel: "Add sponsor", empty: "No sponsors yet.", confirmRemove: true,
  title: (s) => s.name || "New sponsor", template: () => ({ name: "", url: "" }),
};
const FUNDING: Field = { key: "fundingNote", label: "Text shown beneath the sponsors", type: "textarea" };

export function SponsorsView() {
  return (
    <div className="stack">
      <Lede>Shown in this order on the homepage and footer. Logos are optional — sponsors without one appear as text.</Lede>
      <Panel><FieldView f={SPONSOR_LIST} obj={S.data} ctx={{}} bare /></Panel>
      <Panel title="Funding note"><FieldView f={FUNDING} obj={S.data} ctx={{}} /></Panel>
    </div>
  );
}

const DISCIPLINE_LIST: Field = {
  key: "disciplines", label: "Competitions", type: "list", layout: "collapse", item: F.discipline, addLabel: "Add competition", empty: "No competitions yet.", confirmRemove: true,
  title: (d) => d.name || "New competition", badge: (d) => d.org,
  template: () => ({ slug: "", name: "", shortName: "", org: "", _new: true, _open: true }),
  canRemove: (d) => {
    const used = blockers.discipline(d.slug);
    return used.length ? `Can’t remove “${d.name}”: it’s used by ${used.slice(0, 3).join(", ")}${used.length > 3 ? ` and ${used.length - 3} more` : ""}.` : "";
  },
};

export function CompetitionsView() {
  return (
    <div className="stack">
      <Lede>The catalogue of leagues the club enters. Add one here first, then pick it in a team’s competition entry or a result.</Lede>
      <Panel><FieldView f={DISCIPLINE_LIST} obj={S.data} ctx={{}} bare /></Panel>
    </div>
  );
}

/* ───────── Media library ───────── */

function usageMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const walk = (node: unknown, label: string): void => {
    if (typeof node === "string") {
      if (node.startsWith("/content/")) map.set(node, [...(map.get(node) || []), label]);
    } else if (Array.isArray(node)) node.forEach((n) => walk(n, label));
    else if (node && typeof node === "object") {
      const o = node as Obj;
      const l = o.name || o.event || o.title || label;
      for (const [key, v] of Object.entries(o)) if (!key.startsWith("_")) walk(v, l);
    }
  };
  walk(S.data.teams, "a team");
  walk(S.data.achievements, "a result");
  walk(S.data.sponsors, "sponsors");
  return map;
}

export function MediaView() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");
  const [folder, setFolder] = useState("");
  const [, refresh] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    loadMedia().then(() => setReady(true), (e) => setError(e.message));
  }, []);
  if (error) return <Panel title="Couldn’t list files"><p>{error}</p></Panel>;
  if (!ready) return <p className="empty">Loading…</p>;

  const usage = usageMap();
  const lib: Obj = (S.data.mediaDescriptions ||= {});
  const describe = (path: string): string => lib[path] ?? "";
  const undescribed = S.media.filter((m) => isImagePath(m.path) && !describe(m.path).trim());
  function fillFromNames() {
    let n = 0;
    for (const m of undescribed) {
      const d = describeFromFilename(fileName(m.path));
      if (d) { lib[m.path] = d; n++; }
    }
    edited();
    toast(n ? `Described ${n} image${n > 1 ? "s" : ""} from their file names — worth a quick look.` : "None of the file names say anything useful (camera names like IMG_1234). Describe those by hand.", n ? "success" : "info", 5000);
  }
  const folders = [...new Set(S.media.map((m) => dirOf(m.path)))].filter(Boolean).sort();
  const shown = S.media.filter((m) => !term.trim() || (m.path + " " + describe(m.path)).toLowerCase().includes(term.trim().toLowerCase()));

  async function upload(files: File[]) {
    const dir = folder.trim().replace(/^\/+|\/+$/g, "");
    if (!dir) return void toast("Type a folder first, for example team-1/images.", "error");
    const t = toast(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`, "info", 0);
    let n = 0;
    for (const f of files) {
      try {
        await uploadOne(f, dir);
        n++;
      } catch (e) {
        toast(`${f.name}: ${(e as Error).message}`, "error");
      }
    }
    t.dismiss();
    if (n) toast(`Uploaded ${n} file${n > 1 ? "s" : ""} to ${dir}. Attach them from a team, result or sponsor.`, "success");
    refresh((x) => x + 1);
  }

  async function remove(path: string, used?: string[]) {
    const ok = await confirmDialog({
      title: `Delete ${fileName(path)}?`,
      body: used ? `It is still used by ${[...new Set(used)].join(", ")} — the site would show a broken image or link until you change that.` : "It isn’t used anywhere. A copy is kept in admin/.backups/ in case you change your mind.",
      ok: "Delete file", danger: true,
    });
    if (!ok) return;
    try {
      await api(`/api/media?path=${encodeURIComponent(path)}`, { method: "DELETE" });
      S.media = S.media.filter((x) => x.path !== path);
      refresh((x) => x + 1);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  const toggle = (path: string) => setSelected((s) => (s.includes(path) ? s.filter((x) => x !== path) : [...s, path]));
  const imagesShown = shown.filter((m) => isImagePath(m.path));

  async function removeSelected() {
    const usedOnes = selected.filter((p) => usage.get(p));
    const ok = await confirmDialog({
      title: `Delete ${selected.length} file${selected.length > 1 ? "s" : ""}?`,
      body: usedOnes.length
        ? `${usedOnes.length} of them ${usedOnes.length > 1 ? "are" : "is"} still used on the site — those would show broken images or links until you change them. Copies are kept in admin/.backups/.`
        : "None of them is used anywhere. Copies are kept in admin/.backups/ in case you change your mind.",
      ok: "Delete files", danger: true,
    });
    if (!ok) return;
    let n = 0;
    for (const path of selected) {
      try {
        await api(`/api/media?path=${encodeURIComponent(path)}`, { method: "DELETE" });
        S.media = S.media.filter((x) => x.path !== path);
        n++;
      } catch (e) {
        toast(`${fileName(path)}: ${(e as Error).message}`, "error");
      }
    }
    setSelected([]);
    refresh((x) => x + 1);
    if (n) toast(`Deleted ${n} file${n > 1 ? "s" : ""}.`, "success");
  }

  return (
    <div className="stack">
      <Lede>Everything under public/content. Normally you’ll upload from a photo, logo or document field instead — this is for bulk uploads and tidying up.</Lede>
      {!S.meta.hasPublic && <p className="note">There is no public/ folder in this project yet. It will be created with your first upload.</p>}
      <Panel title="Upload">
        <div className={`dropzone${drag ? " drag" : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload([...e.dataTransfer.files]); }}>
          <label>Upload into folder
            <input className="mono" list="folders" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="e.g. team-1/images" aria-label="Upload folder" />
            <datalist id="folders">{folders.map((f) => <option key={f} value={f} />)}</datalist>
          </label>
          <button className="btn primary" onClick={() => input.current?.click()}>Choose files…</button>
          <span className="hint">or drop files here</span>
          <input ref={input} type="file" multiple hidden onChange={(e) => { upload([...(e.target.files || [])]); e.target.value = ""; }} />
        </div>
      </Panel>
      <Panel title={`Files (${S.media.length})`}>
        <p className="help">Each image’s description is stored here, once. Every gallery that shows the image uses it, so you never type the same description twice. New uploads start with a description made from the file name.</p>
        <div className="media-tools">
          <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Filter by file, folder or description…" aria-label="Filter files" />
          <button className="btn sm ghost" onClick={() => setSelected(shown.map((m) => m.path))} disabled={!shown.length}>Select all shown</button>
          {undescribed.length > 0 && <button className="btn sm" onClick={fillFromNames}>Fill {undescribed.length} empty description{undescribed.length > 1 ? "s" : ""} from file names</button>}
        </div>
        {selected.length > 0 && (
          <div className="bulk-bar" role="status">
            <strong>{selected.length}</strong> selected
            <button className="btn sm danger" onClick={removeSelected}>Delete selected…</button>
            <button className="btn sm ghost" onClick={() => setSelected([])}>Clear selection</button>
          </div>
        )}
        <div className="media-grid">
          {shown.length === 0 && <p className="empty">{S.media.length ? "No files match." : "No files uploaded yet. Upload some above, or from any photo, logo or document field."}</p>}
          {shown.map((m) => {
            const used = usage.get(m.path);
            return (
              <figure className={`media-item${selected.includes(m.path) ? " selected" : ""}`} key={m.path}>
                <label className="sel" title="Select"><input type="checkbox" checked={selected.includes(m.path)} onChange={() => toggle(m.path)} aria-label={`Select ${fileName(m.path)}`} /></label>
                {isImagePath(m.path) ? (
                  <button className="media-img" title="View larger" aria-label={`View ${fileName(m.path)} larger`} onClick={() => openLightbox(imagesShown.map((x) => ({ src: x.path })), imagesShown.findIndex((x) => x.path === m.path))}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.path} loading="lazy" alt="" />
                  </button>
                ) : <div className="docicon big">{extOf(m.path).toUpperCase()}</div>}
                <figcaption>
                  <strong title={m.path}>{fileName(m.path)}</strong>
                  <span className="meta">{dirOf(m.path)} · {fmtBytes(m.size)}</span>
                  {isImagePath(m.path) && (
                    <input className={`alt${describe(m.path).trim() ? "" : " empty"}`} value={describe(m.path)} placeholder="Describe this image" aria-label={`Description of ${fileName(m.path)}`} onChange={(e) => { lib[m.path] = e.target.value; edited(); }} />
                  )}
                  <span className={`badge ${used ? "ok" : "warn"}`} title={used ? [...new Set(used)].join(", ") : "Not referenced by any data"}>{used ? `Used ×${used.length}` : "Unused"}</span>
                </figcaption>
                <div className="media-actions">
                  <button className="btn sm" onClick={() => navigator.clipboard.writeText(m.path).then(() => toast("Path copied", "success", 1500))}>Copy path</button>
                  <button className="btn sm danger" onClick={() => remove(m.path, used)}>Delete</button>
                </div>
              </figure>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

/* ───────── Review changes (git, read-only) ───────── */

interface GitInfo { available: boolean; branch?: string; files?: { status: string; file: string }[]; diff?: string; diffTruncated?: boolean }

export function ChangesView() {
  const [g, setG] = useState<GitInfo | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<GitInfo>("/api/git").then(setG, (e) => setError(e.message));
  }, []);
  if (error) return <Panel title="Couldn’t read git status"><p>{error}</p></Panel>;
  if (!g) return <p className="empty">Checking git…</p>;

  const unsaved = dirtyDatasets().length > 0 && <p className="note">You have unsaved edits in this editor — save them first, or they won’t show up below.</p>;
  if (!g.available) return <div className="stack">{unsaved}<Panel title="Git isn’t available here"><p>This folder isn’t a git repository (or git isn’t installed), so there’s nothing to compare. Your edits are saved in src/data and public/content as usual.</p></Panel></div>;

  const files = g.files || [];
  const label: Record<string, string> = { M: "edited", A: "added", D: "deleted", "??": "new", R: "renamed" };
  const List = ({ items }: { items: typeof files }) => (
    <ul className="files">{items.map((f) => <li key={f.file}><span className={`st st-${f.status === "??" ? "new" : f.status}`}>{label[f.status] || f.status}</span><code>{f.file}</code></li>)}</ul>
  );
  const data = files.filter((f) => f.file.startsWith("src/"));
  const uploads = files.filter((f) => f.file.startsWith("public/"));
  const cmd = 'git add -A\ngit commit -m "Update website content"\ngit push';

  return (
    <div className="stack">
      {unsaved}
      {!files.length ? (
        <Panel title="No changes"><p>Everything in src/ and public/ matches the last commit{g.branch ? ` on ${g.branch}` : ""}.</p></Panel>
      ) : (
        <>
          <Panel title={`Changed files${g.branch ? ` (branch ${g.branch})` : ""}`}>
            {data.length > 0 && <div><h3>Text and settings</h3><List items={data} /></div>}
            {uploads.length > 0 && <div><h3>Uploaded files ({uploads.length})</h3><List items={uploads} /></div>}
          </Panel>
          {g.diff && (
            <Panel title="Text changes">
              <pre className="diff">
                {g.diff.split("\n").map((line, i) => {
                  const cls = /^(\+\+\+|---|diff |index )/.test(line) ? "file" : line.startsWith("@@") ? "hunk" : line.startsWith("+") ? "add" : line.startsWith("-") ? "del" : "";
                  return <span key={i} className={`dl ${cls}`}>{line}{"\n"}</span>;
                })}
              </pre>
              {g.diffTruncated && <p className="help">Diff truncated. Run git diff for the full picture.</p>}
            </Panel>
          )}
          <Panel title="When it looks right">
            <p>Open a terminal in the project folder and run:</p>
            <pre className="cmd">{cmd}</pre>
            <button className="btn" onClick={() => navigator.clipboard.writeText(cmd.replace(/\n/g, " && ")).then(() => toast("Commands copied", "success", 1500))}>Copy commands</button>
          </Panel>
        </>
      )}
    </div>
  );
}
