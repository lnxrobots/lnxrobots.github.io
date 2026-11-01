// Run with: npm test   (Node 22.6+; uses built-in type stripping)
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { readConsts, renderConsts } from "../src/lib/tsdata.ts";

const SAMPLE = `import { getTeam } from "./teams";

/** Header comment: don't touch me. */
export const items = [
  // a comment that must survive
  { id: "a", label: getTeam("t1")?.name + ": 1st place", tags: ["x", "y"] },
  {
    id: "b",
    note:
      "a long string moved onto its own line",
    gallery: [
      { src: "/content/1.jpg", alt: "one" },
      { src: "/content/2.jpg", alt: "two" },
    ],
  }
];

export const title = "Hello";
`;
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const read = (t: string) => readConsts(t, ["items", "title"]);

test("an unchanged value is written back byte-for-byte", () => {
  assert.equal(renderConsts(SAMPLE, read(SAMPLE)), SAMPLE);
});

test("team-name expressions survive as {{team:…}} tokens", () => {
  assert.equal(read(SAMPLE).items[0].label, "{{team:t1}}: 1st place");
});

test("editing one field changes only that line", () => {
  const v = clone(read(SAMPLE));
  v.items[1].gallery[1].alt = "two (edited)";
  const out = renderConsts(SAMPLE, v);
  const a = SAMPLE.split("\n"), b = out.split("\n");
  assert.equal(b.length, a.length);
  assert.equal(b.filter((l, i) => l !== a[i]).length, 1);
  assert.deepEqual(read(out), v);
});

test("adding and removing items keeps comments and the rest intact", () => {
  const v = clone(read(SAMPLE));
  v.items[1].gallery.push({ src: "/content/3.jpg", alt: "three" });
  v.items.splice(0, 1);
  v.items.push({ id: "c", label: "{{team:t1}}: new" });
  const out = renderConsts(SAMPLE, v);
  assert.match(out, /Header comment/);
  assert.match(out, /getTeam\("t1"\)\?\.name \+ ": new"/);
  assert.deepEqual(read(out), v);
});

test("a map keyed by file path is written one entry per line", () => {
  const src = "export const m: Record<string, string> = {};\n";
  const out = renderConsts(src, { m: { "/a.jpg": "A", "/b.jpg": "B" } });
  assert.equal(out, 'export const m: Record<string, string> = {\n  "/a.jpg": "A",\n  "/b.jpg": "B",\n};\n');
  const again = renderConsts(out, { m: { "/a.jpg": "A", "/b.jpg": "B", "/c.jpg": "C" } });
  assert.equal(again.split("\n").length, out.split("\n").length + 1); // one new line, nothing else moved
});

test("output is still valid TypeScript", async () => {
  const { stripTypeScriptTypes } = await import("node:module");
  const v = clone(read(SAMPLE));
  v.items.unshift({ id: "z", label: "new", tags: [] });
  assert.doesNotThrow(() => stripTypeScriptTypes(renderConsts(SAMPLE, v)));
});

test("editing a page text changes only that text (interface and comments untouched)", () => {
  const text = `/** Page texts. */
export interface Copy {
  home: { heroTitle: string; teamsTitle: string; teamsText: string };
}

export const copy: Copy = {
  home: {
    heroTitle: "Turning spare parts into world-class robots.",
    teamsTitle: "People come and go",
    teamsText:
      "We have one mentor who's been with the club the whole time. The teams themselves change more.",
  },
};
`;
  const v = clone(readConsts(text, ["copy"]));
  v.copy.home.teamsTitle = "People come and go, projects stay";
  const out = renderConsts(text, v);
  const a = text.split("\n"), b = out.split("\n");
  assert.equal(b.length, a.length);
  assert.equal(b.filter((l, i) => l !== a[i]).length, 1);
  assert.deepEqual(readConsts(out, ["copy"]), v);
});

// Self-check against the real site data, if this app sits inside the website project.
const dataDir = path.resolve(import.meta.dirname, "../../src/data");
const files: Record<string, string[]> = { "site.ts": ["site"], "teams.ts": ["teams"], "achievements.ts": ["achievements"], "sponsors.ts": ["sponsors", "fundingNote"], "disciplines.ts": ["disciplines"], "copy.ts": ["copy"] };
for (const [file, names] of Object.entries(files)) {
  test(`real data file ${file} round-trips unchanged`, { skip: !fs.existsSync(path.join(dataDir, file)) }, () => {
    const text = fs.readFileSync(path.join(dataDir, file), "utf8");
    assert.equal(renderConsts(text, readConsts(text, names)), text);
  });
}
