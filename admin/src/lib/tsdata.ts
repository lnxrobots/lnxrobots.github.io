/**
 * Reads and surgically edits the data constants in src/data/*.ts.
 *
 * The data files are hand-written TypeScript with comments and their own
 * formatting. Rather than regenerate them, we compare the old value with the
 * new one and rewrite only the parts that changed — everything else (comments,
 * blank lines, hand formatting) stays byte-for-byte identical, so the git
 * diff shows exactly what you edited and nothing else.
 */
import vm from "node:vm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Obj = Record<string, any>;
interface Prop { key: string; ks: number; lead: string; keyText: string; sep: string; start: number; end: number }

/* ───────────────────────── scanning ───────────────────────── */

/**
 * Same-length copy of `src` with the insides of comments and string literals
 * blanked out, so brackets/commas/semicolons inside them can't fool the scanner.
 */
export function maskSource(src: string): string {
  let out = "";
  let i = 0;
  const n = src.length;
  const blank = (ch: string) => (ch === "\n" || ch === "\r" ? ch : " ");
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "/") {
      while (i < n && src[i] !== "\n") out += blank(src[i++]);
      continue;
    }
    if (c === "/" && d === "*") {
      out += "  ";
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) out += blank(src[i++]);
      if (i < n) {
        out += "  ";
        i += 2;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      out += c;
      i++;
      while (i < n && src[i] !== c) {
        if (src[i] === "\\" && i + 1 < n) {
          out += " " + blank(src[i + 1]);
          i += 2;
          continue;
        }
        out += blank(src[i++]);
      }
      if (i < n) out += src[i++];
      continue;
    }
    out += c;
    i++;
  }
  if (out.length !== src.length) throw new Error("Internal error: source masking changed the length");
  return out;
}

/** Finds the [start, end) range of the value in `export const NAME[: Type] = <value>;` */
export function findConst(masked: string, name: string): { start: number; end: number } {
  const m = new RegExp(`export\\s+const\\s+${name}\\b`).exec(masked);
  if (!m) throw new Error(`Couldn't find "export const ${name}" in the file.`);
  let i = masked.indexOf("=", m.index + m[0].length);
  if (i < 0) throw new Error(`Couldn't find the "=" for "${name}".`);
  i++;
  while (i < masked.length && /\s/.test(masked[i])) i++;
  const start = i;
  let depth = 0;
  for (; i < masked.length; i++) {
    const c = masked[i];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") depth--;
    else if (c === ";" && depth === 0) break;
  }
  let end = i;
  while (end > start && /\s/.test(masked[end - 1])) end--;
  return { start, end };
}

/* ───────────────────────── evaluating ───────────────────────── */

/*
 * achievements.ts builds a couple of labels from a team's name, e.g.
 *   getTeam("team-1")?.name + ": 1st place, Soccer Open"
 * We evaluate with a stand-in getTeam() that leaves a marker, and expose the
 * marker as {{team:team-1}} so such labels survive editing.
 */
const MARK_IN = /\u0001team:([A-Za-z0-9_-]+)\u0001/g;
const TOKEN = /\{\{team:([A-Za-z0-9_-]+)\}\}/;
const TOKEN_SPLIT = /(\{\{team:[A-Za-z0-9_-]+\}\})/;

function mapStrings(v: unknown, fn: (s: string) => string): unknown {
  if (typeof v === "string") return fn(v);
  if (Array.isArray(v)) return v.map((x) => mapStrings(x, fn));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mapStrings(x, fn)]));
  return v;
}

export function evalLiteral(text: string): unknown {
  const sandbox = vm.createContext(
    { getTeam: (slug: string) => ({ name: `\u0001team:${slug}\u0001` }) },
    { codeGeneration: { strings: false, wasm: false } },
  );
  const value = vm.runInContext(`(${text})`, sandbox, { timeout: 1000 });
  return mapStrings(JSON.parse(JSON.stringify(value)), (s) => s.replace(MARK_IN, "{{team:$1}}"));
}

/** Canonical JSON (sorted keys) — equal data compares equal whatever the key order. */
export function canon(v: unknown): string {
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  if (v && typeof v === "object") {
    return "{" + Object.keys(v as Obj).filter((k) => (v as Obj)[k] !== undefined).sort().map((k) => JSON.stringify(k) + ":" + canon((v as Obj)[k])).join(",") + "}";
  }
  return JSON.stringify(v);
}

const isObj = (v: unknown): v is Obj => v !== null && typeof v === "object" && !Array.isArray(v);
const isPrim = (x: unknown) => x === null || typeof x !== "object";

/** Parse all the requested consts out of a file's text. */
export function readConsts(text: string, names: string[]): Obj {
  const masked = maskSource(text);
  const out: Obj = {};
  for (const name of names) {
    const { start, end } = findConst(masked, name);
    try {
      out[name] = evalLiteral(text.slice(start, end));
    } catch (e) {
      throw new Error(`Couldn't read "${name}": ${(e as Error).message}`);
    }
  }
  return out;
}

/* ───────────────────────── formatting new code ───────────────────────── */

const WIDTH = 100; // long strings move onto their own line past this
const INLINE_MAX = 200; // objects of plain values stay on one line up to this
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function fmtString(s: string): string {
  if (!TOKEN.test(s)) return JSON.stringify(s);
  return s
    .split(TOKEN_SPLIT)
    .filter((p) => p !== "")
    .map((p) => {
      const m = TOKEN.exec(p);
      return m && m[0] === p ? `getTeam(${JSON.stringify(m[1])})?.name` : JSON.stringify(p);
    })
    .join(" + ");
}

const fmtKey = (k: string) => (IDENT.test(k) ? k : JSON.stringify(k));

function fmtProp(k: string, x: unknown, ind: string): string {
  const head = `${fmtKey(k)}: `;
  const val = fmt(x, ind, head.length);
  if (typeof x === "string" && ind.length + head.length + val.length + 1 > WIDTH) return `${fmtKey(k)}:\n${ind}  ${val}`;
  return head + val;
}

/** `ind` = indentation of the line this value starts on; `pre` = characters already on that line before it. */
export function fmt(v: unknown, ind = "", pre = 0): string {
  if (v === null) return "null";
  if (typeof v === "string") return fmtString(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  const inner = ind + "  ";

  if (Array.isArray(v)) {
    if (!v.length) return "[]";
    if (v.every(isPrim)) {
      const flat = "[" + v.map((x) => fmt(x)).join(", ") + "]";
      if (ind.length + pre + flat.length + 1 <= WIDTH) return flat;
    }
    return "[\n" + v.map((x) => inner + fmt(x, inner, 0) + ",\n").join("") + ind + "]";
  }

  const entries = Object.entries(v as Obj).filter(([, x]) => x !== undefined);
  if (!entries.length) return "{}";
  // a map keyed by file path (the media descriptions) reads best one entry per line
  const pathMap = entries.some(([k]) => k.startsWith("/"));
  if (!pathMap && entries.every(([, x]) => isPrim(x))) {
    const flat = "{ " + entries.map(([k, x]) => `${fmtKey(k)}: ${fmt(x)}`).join(", ") + " }";
    if (flat.length <= INLINE_MAX) return flat;
  }
  return "{\n" + entries.map(([k, x]) => `${inner}${fmtProp(k, x, inner)},\n`).join("") + ind + "}";
}

/* ───────────────────────── structural parsing ───────────────────────── */

const WS = /\s/;
const skipWs = (m: string, i: number, limit: number) => {
  while (i < limit && WS.test(m[i])) i++;
  return i;
};

/** From the start of a value, find the `,` (or the closing bracket) that ends it at depth 0. */
function scanValueEnd(m: string, i: number, limit: number): number {
  let depth = 0;
  for (; i < limit; i++) {
    const c = m[i];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      if (depth === 0) break;
      depth--;
    } else if (c === "," && depth === 0) break;
  }
  return i;
}

function parseArray(src: string, m: string, start: number, end: number) {
  const close = end - 1;
  const items: { lead: string; start: number; end: number }[] = [];
  let prevEnd = start + 1;
  let i = start + 1;
  let trailingComma = false;
  for (;;) {
    const s = skipWs(m, i, close);
    if (s >= close) break;
    const e = scanValueEnd(m, s, close);
    let itemEnd = e;
    while (itemEnd > s && WS.test(m[itemEnd - 1])) itemEnd--;
    items.push({ lead: src.slice(prevEnd, s), start: s, end: itemEnd });
    if (m[e] === ",") {
      trailingComma = true;
      prevEnd = e + 1;
      i = e + 1;
    } else {
      trailingComma = false;
      prevEnd = itemEnd;
      break;
    }
  }
  return { items, trailingComma, tail: src.slice(items.length ? prevEnd : start + 1, close) };
}

function parseObject(src: string, m: string, start: number, end: number) {
  const close = end - 1;
  const props: Prop[] = [];
  let prevEnd = start + 1;
  let i = start + 1;
  let trailingComma = false;
  for (;;) {
    const ks = skipWs(m, i, close);
    if (ks >= close) break;
    let key: string;
    let ke: number;
    if (m[ks] === '"' || m[ks] === "'") {
      ke = m.indexOf(m[ks], ks + 1) + 1;
      key = evalLiteral(src.slice(ks, ke)) as string;
    } else {
      const mm = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(m.slice(ks, close));
      if (!mm) throw new Error("Unsupported property syntax");
      key = mm[0];
      ke = ks + key.length;
    }
    const colon = skipWs(m, ke, close);
    if (m[colon] !== ":") throw new Error("Unsupported property syntax (shorthand or method)");
    const vs = skipWs(m, colon + 1, close);
    const e = scanValueEnd(m, vs, close);
    let ve = e;
    while (ve > vs && WS.test(m[ve - 1])) ve--;
    props.push({ key, ks, lead: src.slice(prevEnd, ks), keyText: src.slice(ks, ke), sep: src.slice(ke, vs), start: vs, end: ve });
    if (m[e] === ",") {
      trailingComma = true;
      prevEnd = e + 1;
      i = e + 1;
    } else {
      trailingComma = false;
      prevEnd = ve;
      break;
    }
  }
  return { props, trailingComma, tail: src.slice(props.length ? prevEnd : start + 1, close) };
}

/* ───────────────────────── patching ───────────────────────── */

const lineStart = (src: string, pos: number) => src.lastIndexOf("\n", pos - 1) + 1;
const lineIndent = (src: string, pos: number) => /^[ \t]*/.exec(src.slice(lineStart(src, pos)))![0];

function tryEval(text: string): unknown {
  try {
    return evalLiteral(text);
  } catch {
    return undefined;
  }
}

/** Returns the replacement text for src[start, end) so that it evaluates to `newVal`. */
function patchNode(src: string, m: string, start: number, end: number, newVal: unknown, ind: string): string {
  const oldText = src.slice(start, end);
  const oldVal = tryEval(oldText);
  if (oldVal !== undefined && canon(oldVal) === canon(newVal)) return oldText; // untouched: keep verbatim

  const multiline = oldText.includes("\n");
  if (m[start] === "[" && m[end - 1] === "]" && Array.isArray(newVal) && multiline) {
    const node = parseArray(src, m, start, end);
    if (node.items.length) return patchArray(src, m, node, newVal, ind);
  }
  if (m[start] === "{" && m[end - 1] === "}" && isObj(newVal) && multiline) {
    const node = parseObject(src, m, start, end);
    if (node.props.length) return patchObject(src, m, node, newVal, ind);
  }
  return fmt(newVal, ind, Math.max(0, start - lineStart(src, start) - ind.length));
}

function patchArray(src: string, m: string, node: ReturnType<typeof parseArray>, newArr: unknown[], ind: string): string {
  const old = node.items.map((it) => {
    const text = src.slice(it.start, it.end);
    const val = tryEval(text);
    return { ...it, text, key: val === undefined ? null : canon(val) } as typeof it & { text: string; key: string | null };
  });
  const newKeys = newArr.map(canon);
  const n = old.length;
  const k = newArr.length;
  const itemInd = old[0].lead.includes("\n") ? lineIndent(src, old[0].start) : ind + "  ";

  // Longest-common-subsequence alignment of identical items.
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(k + 1));
  for (let a = n - 1; a >= 0; a--) {
    for (let b = k - 1; b >= 0; b--) {
      dp[a][b] = old[a].key === newKeys[b] ? dp[a + 1][b + 1] + 1 : Math.max(dp[a + 1][b], dp[a][b + 1]);
    }
  }
  const pairs: [number, number][] = [];
  for (let a = 0, b = 0; a < n && b < k; ) {
    if (old[a].key === newKeys[b]) pairs.push([a++, b++]);
    else if (dp[a + 1][b] >= dp[a][b + 1]) a++;
    else b++;
  }
  pairs.push([n, k]);

  const pieces: { lead: string; text: string }[] = [];
  let a = 0;
  let b = 0;
  for (const [pa, pb] of pairs) {
    // Items between matches: pair them up in order (an edit), then insert any extras.
    const oldRun = pa - a;
    const newRun = pb - b;
    for (let t = 0; t < newRun; t++) {
      if (t < oldRun) {
        const o = old[a + t];
        pieces.push({ lead: o.lead, text: patchNode(src, m, o.start, o.end, newArr[b + t], itemInd) });
      } else {
        pieces.push({ lead: "\n" + itemInd, text: fmt(newArr[b + t], itemInd, 0) });
      }
    }
    if (pa < n) pieces.push({ lead: old[pa].lead, text: old[pa].text });
    a = pa + 1;
    b = pb + 1;
  }

  if (!pieces.length) return "[]";
  const last = pieces.length - 1;
  return "[" + pieces.map((p, i) => p.lead + p.text + (i < last || node.trailingComma ? "," : "")).join("") + node.tail + "]";
}

function patchObject(src: string, m: string, node: ReturnType<typeof parseObject>, newObj: Obj, ind: string): string {
  const propInd = node.props[0].lead.includes("\n") ? lineIndent(src, node.props[0].ks) : ind + "  ";
  const remaining = new Map<string, unknown>(Object.entries(newObj).filter(([, v]) => v !== undefined));
  const pieces: string[] = [];
  for (const p of node.props) {
    if (!remaining.has(p.key)) continue; // removed
    const nv = remaining.get(p.key);
    remaining.delete(p.key);
    pieces.push(p.lead + p.keyText + p.sep + patchNode(src, m, p.start, p.end, nv, propInd));
  }
  for (const [k, v] of remaining) pieces.push("\n" + propInd + fmtProp(k, v, propInd));

  if (!pieces.length) return "{}";
  const last = pieces.length - 1;
  return "{" + pieces.map((t, i) => t + (i < last || node.trailingComma ? "," : "")).join("") + node.tail + "}";
}

/**
 * Returns `text` with each named const rewritten to hold `values[name]`,
 * touching only the parts of the file that actually changed.
 */
export function renderConsts(text: string, values: Obj): string {
  const masked = maskSource(text);
  const spans = Object.keys(values)
    .map((name) => ({ name, ...findConst(masked, name) }))
    .sort((a, b) => b.start - a.start);
  let out = text;
  for (const { name, start, end } of spans) {
    const code = patchNode(text, masked, start, end, values[name], lineIndent(text, start));
    out = out.slice(0, start) + code + out.slice(end);
  }
  if (text.includes("\r\n")) out = out.replace(/\r?\n/g, "\r\n");
  return out;
}
