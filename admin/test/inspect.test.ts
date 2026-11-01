import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { readConsts } from "../src/lib/tsdata.ts";
import { buildIndex, resolve, routeForPath, pathForRoute, imgPath, normPath, onPathMessage, type Cand } from "../src/ui/inspect.ts";

// Real site data (skipped if this app isn't inside the website project).
const dir = path.resolve(import.meta.dirname, "../../src/data");
const have = fs.existsSync(path.join(dir, "teams.ts"));
const load = (f: string, names: string[]) => readConsts(fs.readFileSync(path.join(dir, f), "utf8"), names);

function data() {
  const d = { ...load("site.ts", ["site"]), ...load("teams.ts", ["teams"]), ...load("achievements.ts", ["achievements"]), ...load("sponsors.ts", ["sponsors", "fundingNote"]), ...load("disciplines.ts", ["disciplines"]) } as Record<string, any>;
  d.teams.forEach((t: any) => (t._k = t.slug));
  d.achievements.forEach((a: any) => (a._k = a.id));
  return d;
}
const text = (t: string, extra: Partial<Cand> = {}): Cand => ({ tag: "p", text: t, ...extra });

test("clicking a team's name finds that field", { skip: !have }, () => {
  const d = data(), idx = buildIndex(d);
  const r = resolve(idx, [{ tag: "h2", text: d.teams[0].name }], null)!;
  assert.equal(r.entry.route, `#/teams/${d.teams[0].slug}`);
  assert.equal(r.entry.key, "name");
});

test("text is matched case- and whitespace-insensitively", { skip: !have }, () => {
  const d = data(), idx = buildIndex(d);
  const r = resolve(idx, [{ tag: "h2", text: "  " + d.teams[0].name.toUpperCase().replace(/ /g, "   ") + " " }], null)!;
  assert.equal(r.entry.key, "name");
});

test("identical text in two fields lists the other as an alternative", { skip: !have }, () => {
  const d = data(), t = d.teams[0];
  t.designation = t.name;
  const r = resolve(buildIndex(d), [text(t.name)], null)!;
  assert.ok([r.entry, ...r.alternatives].some((e) => e.key === "designation") && [r.entry, ...r.alternatives].some((e) => e.key === "name"));
});

test("the page being shown wins when text appears in several places", { skip: !have }, () => {
  const d = data();
  const t1 = d.teams[0], t2 = d.teams[1];
  t1.members[0].role = t2.members[0].role = "Same role";
  const idx = buildIndex(d);
  const r = resolve(idx, [text("Same role")], `#/teams/${t2.slug}`)!;
  assert.equal(r.entry.route, `#/teams/${t2.slug}`);
  assert.ok(r.alternatives.length >= 1);
});

test("repeated labels on one page are told apart by position", () => {
  const team = { _k: "t", slug: "t", name: "T", members: [{ name: "A", role: "Software" }, { name: "B", role: "Software" }, { name: "C", role: "Software" }] };
  const idx = buildIndex({ teams: [team], achievements: [], sponsors: [], disciplines: [], site: {} });
  const r = resolve(idx, [text("Software", { rank: 2, total: 3 })], "#/teams/t")!;
  assert.equal(r.entry.obj.name, "C");
});

test("images match through Next's /_next/image wrapper", { skip: !have }, () => {
  const d = data(), idx = buildIndex(d);
  const sp = d.sponsors.find((s: any) => s.logo)!;
  assert.equal(imgPath(`http://localhost:3000/_next/image?url=${encodeURIComponent(sp.logo)}&w=256&q=75`), sp.logo);
  const r = resolve(idx, [{ tag: "img", text: "", src: `http://localhost:3000/_next/image?url=${encodeURIComponent(sp.logo)}&w=256&q=75` }], null)!;
  assert.equal(r.entry.key, "logo");
  assert.equal(r.entry.route, "#/sponsors");
});

test("links match their data (e.g. a sponsor's website)", { skip: !have }, () => {
  const d = data(), idx = buildIndex(d);
  const r = resolve(idx, [{ tag: "a", text: "", href: d.sponsors[0].url }], null)!;
  assert.equal(r.entry.key, "url");
});

test("clicking a card's padding opens that record, not a random field", { skip: !have }, () => {
  const d = data(), idx = buildIndex(d), t = d.teams[0];
  const r = resolve(idx, [{ tag: "div", text: `${t.designation} ${t.name} ${t.tagline}` }, { tag: "section", text: "everything on the page" }], null)!;
  assert.equal(r.container, true);
  assert.equal(r.entry.route, `#/teams/${t.slug}`);
});

test("walks outward: a decorative child falls through to the parent that matches", { skip: !have }, () => {
  const d = data(), idx = buildIndex(d);
  const r = resolve(idx, [text("★"), text(d.teams[0].tagline)], null)!;
  assert.equal(r.candIndex, 1);
});

test("the page shows saved text, so unsaved edits don't break matching", { skip: !have }, () => {
  const d = data();
  d.teams[0]._s = { tagline: d.teams[0].tagline };
  const saved = d.teams[0].tagline;
  d.teams[0].tagline = "typed but not saved yet";
  const idx = buildIndex(d);
  assert.equal(resolve(idx, [text(saved)], null)!.entry.key, "tagline");
  assert.equal(resolve(idx, [text("typed but not saved yet")], null), null);
});

test("{{team:…}} results match the team name the site renders", { skip: !have }, () => {
  const d = data(), idx = buildIndex(d);
  const a = d.achievements.find((x: any) => x.results.some((r: any) => r.label.includes("{{team:")))!;
  const label = a.results.find((r: any) => r.label.includes("{{team:"))!.label as string;
  const shown = label.replace(/\{\{team:([^}]+)\}\}/g, (_: string, s: string) => d.teams.find((t: any) => t.slug === s).name);
  assert.equal(resolve(idx, [text(shown)], null)!.entry.obj.label, label);
});

test("unknown elements resolve to nothing", { skip: !have }, () => {
  assert.equal(resolve(buildIndex(data()), [text("Completely unrelated words here")], null), null);
});

test("page ⇄ editor route mapping", { skip: !have }, () => {
  const d = data(), t = d.teams[0], a = d.achievements[0];
  assert.equal(routeForPath(d, "/"), null);
  assert.equal(routeForPath(d, `/team/${t.slug}`), `#/teams/${t.slug}`);
  assert.equal(routeForPath(d, `/event/${a.id}`), `#/results/${a.id}`);
  assert.equal(pathForRoute(d, `#/teams/${t.slug}`), `/team/${t.slug}`);
  assert.equal(pathForRoute(d, `#/results/${a.id}`), `/event/${a.id}`);
  assert.equal(pathForRoute(d, "#/media"), null);
});

/* ───── card / block hover (the "different thing on every page" bug) ───── */

test("hovering a team card's padding always means that team — on any page", { skip: !have }, () => {
  const d = data(), t = d.teams[0];
  // what the site renders inside a team card (name, tagline, and the competition tags)
  const cardText = `Since ${t.since} ${t.name} ACTIVE Soccer Open Soccer InfraRed ${t.tagline} 5 people 2 campaigns View team →`;
  for (const pageRoute of [null, "#/site", `#/teams/${t.slug}`, "#/results/2026-vienna", "#/competitions"]) {
    const r = resolve(buildIndex(d), [{ tag: "div", text: cardText }, { tag: "a", text: cardText, href: `/team/${t.slug}/` }], pageRoute)!;
    assert.equal(r.container, true, String(pageRoute));
    assert.equal(r.entry.route, `#/teams/${t.slug}`, String(pageRoute));
    assert.equal(r.entry.obj, t, String(pageRoute));
    assert.equal(r.entry.label, `Team “${t.name}”`, String(pageRoute));
  }
});

test("a link to /team/<slug> or /event/<id> is that team's or result's card", { skip: !have }, () => {
  const d = data(), idx = buildIndex(d);
  assert.equal(resolve(idx, [{ tag: "a", text: "View team →", href: `/team/${d.teams[1].slug}` }], null)!.entry.obj, d.teams[1]);
  assert.equal(resolve(idx, [{ tag: "a", text: "View event →", href: `/event/${d.achievements[0].id}` }], null)!.entry.obj, d.achievements[0]);
});

test("a member card resolves to that member, not the whole team", { skip: !have }, () => {
  const d = data(), t = d.teams[0], m = t.members[0];
  const r = resolve(buildIndex(d), [{ tag: "div", text: `${m.name} ${m.role}` }], null)!;
  assert.equal(r.container, true);
  assert.equal(r.entry.obj, m);
  assert.match(r.entry.label, new RegExp(`^Team “${t.name}” › ${m.name}`));
});

test("a block holding several teams isn't any one team", { skip: !have }, () => {
  const d = data();
  const both = d.teams.map((t: any) => `${t.name} ${t.tagline}`).join(" ");
  assert.equal(resolve(buildIndex(d), [{ tag: "section", text: both }], null), null);
});

test("the cover image gets its own label", () => {
  const d = { teams: [{ _k: "t", slug: "t", name: "Team T", cover: { src: "/content/t/cover.jpg", alt: "Team T at the pits" }, members: [], mentors: [], campaigns: [] }], achievements: [], sponsors: [], disciplines: [], site: { cover: { src: "/content/cover.jpg", alt: "Nyvora" } } };
  const idx = buildIndex(d);
  assert.equal(resolve(idx, [{ tag: "img", text: "", src: "/_next/image?url=%2Fcontent%2Ft%2Fcover.jpg&w=640&q=75" }], null)!.entry.label, "Team T › Cover image › Photo");
  assert.equal(resolve(idx, [{ tag: "img", text: "", src: "/content/cover.jpg" }], null)!.entry.label, "Site › Cover image › Photo");
});

test("a sentence that merely mentions a known word is not a record (the 'People come and go' bug)", { skip: !have }, () => {
  const d = data();
  d.teams[0].mentors = [{ name: "Some Mentor", role: "Mentor" }];
  const para = "We have one mentor who's been with the club the whole time. The teams themselves change more — every season some people graduate out and new ones join in.";
  assert.equal(resolve(buildIndex(d), [{ tag: "p", text: para }, { tag: "section", text: `the teams People come and go ${para}` }], null), null);
});

test("…but once that text is in the data, clicking it edits that text", () => {
  const para = "We have one mentor who's been with the club the whole time.";
  const d: any = { teams: [{ _k: "t", slug: "t", name: "Team T", members: [], mentors: [{ name: "M", role: "Mentor" }], campaigns: [] }], achievements: [], sponsors: [], disciplines: [], site: {}, copy: { home: { teamsText: para } } };
  const r = resolve(buildIndex(d), [{ tag: "p", text: para }], null)!;
  assert.equal(r.entry.key, "teamsText");
  assert.equal(r.entry.route, "#/texts");
});

/* ───── decorated labels ("// the teams") and page ⇄ route rules ───── */

const textsData = () => ({
  teams: [{ _k: "t", slug: "t", name: "Team T", members: [], mentors: [{ name: "M", role: "Mentor" }], campaigns: [] }],
  achievements: [], sponsors: [], disciplines: [], site: { name: "LNX Robots" },
  copy: { home: { teamsLabel: "the teams", teamsTitle: "People come and go", latestLabel: "most recent result" } },
});

test("a label with decoration ('// the teams') edits that text — not 'Site'", () => {
  const r = resolve(buildIndex(textsData()), [{ tag: "p", text: "// the teams" }], null)!;
  assert.equal(r.container, false);
  assert.equal(r.entry.key, "teamsLabel");
  assert.equal(r.entry.route, "#/texts");
  assert.equal(r.entry.label, "Page texts › Homepage › Teams section label");
});

test("decoration around any single known text still finds it", () => {
  const idx = buildIndex(textsData());
  for (const text of ["// the teams", "01 / the teams", "→ the teams", "[ the teams ]"]) assert.equal(resolve(idx, [{ tag: "p", text }], null)!.entry.key, "teamsLabel", text);
  assert.equal(resolve(idx, [{ tag: "p", text: "// most recent result" }], null)!.entry.key, "latestLabel");
});

test("blocks of page text are labelled 'Page texts', never 'Site'", () => {
  const r = resolve(buildIndex(textsData()), [{ tag: "div", text: "// the teams People come and go" }], null)!;
  assert.equal(r.container, true);
  assert.equal(r.entry.label, "Page texts › Homepage");
});

test("page ⇄ editor routes: the home page and pages without a page of their own don't switch tabs", () => {
  const d = textsData() as any;
  d.teams[0]._k = "t";
  assert.equal(routeForPath(d, "/"), null);             // browsing Home keeps whatever tab you're on
  assert.equal(routeForPath(d, "/about"), null);
  assert.equal(routeForPath(d, "/team/t/"), "#/teams/t"); // trailing slash is fine
  assert.equal(pathForRoute(d, "#/sponsors"), "/about"); // sponsors are shown on the About page
  assert.equal(pathForRoute(d, "#/competitions"), null);  // no page of its own: the preview stays put
  assert.equal(pathForRoute(d, "#/texts"), "/");
  assert.equal(pathForRoute(d, "#/site"), "/");
});

test("normPath ignores trailing slashes, queries and hashes", () => {
  assert.equal(normPath("/team/t/"), "/team/t");
  assert.equal(normPath("/about?x=1#top"), "/about");
  assert.equal(normPath("/"), "/");
});

/* ───── the follow-editor flows from the bug reports ───── */

test("opening the Competitions tab: the preview doesn't move, so the editor can't be switched", () => {
  const d = textsData() as any;
  assert.equal(pathForRoute(d, "#/competitions"), null); // App asks the preview to go nowhere
});

test("opening the Sponsors tab shows the About page and the editor STAYS on Sponsors", () => {
  const d = textsData() as any;
  // App: tab opened → preview asked to open /about, remembered in followNav
  const p = pathForRoute(d, "#/sponsors")!;
  const out = onPathMessage(d, { path: "/about", ready: false }, { pagePath: "/", followNav: normPath(p), hash: "#/sponsors" });
  assert.equal(out.switchTo, null);   // no bounce back to another tab
  assert.equal(out.followNav, null);  // and the marker is used up
});

test("…the same with a trailing slash on the arrived path (trailingSlash sites)", () => {
  const d = textsData() as any;
  assert.equal(onPathMessage(d, { path: "/about/", ready: false }, { pagePath: "/", followNav: "/about", hash: "#/sponsors" }).switchTo, null);
});

test("browsing the preview to a team page DOES bring the editor along", () => {
  const d = textsData() as any;
  const out = onPathMessage(d, { path: "/team/t", ready: false }, { pagePath: "/teams", followNav: null, hash: "#/media" });
  assert.equal(out.switchTo, "#/teams/t");
});

test("browsing back to the home page leaves the editor on its current tab", () => {
  const d = textsData() as any;
  assert.equal(onPathMessage(d, { path: "/", ready: false }, { pagePath: "/team/t", followNav: null, hash: "#/sponsors" }).switchTo, null);
});

test("connecting (ready) or reloading never switches tabs", () => {
  const d = textsData() as any;
  assert.equal(onPathMessage(d, { path: "/team/t", ready: true }, { pagePath: "/", followNav: null, hash: "#/sponsors" }).switchTo, null);
});

test("a stale marker doesn't swallow a later, genuine navigation", () => {
  const d = textsData() as any;
  // the editor asked for /about earlier; the person then browses to a team page
  const out = onPathMessage(d, { path: "/team/t", ready: false }, { pagePath: "/", followNav: "/about", hash: "#/sponsors" });
  assert.equal(out.switchTo, "#/teams/t");
  assert.equal(out.followNav, "/about"); // untouched (expires on its own timer)
});
