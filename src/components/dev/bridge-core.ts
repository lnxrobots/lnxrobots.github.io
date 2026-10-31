/**
 * Dev-only bridge between this website and the content editor (the `admin/` app).
 *
 * When the site is shown inside the editor's preview (an iframe), this reports what the
 * mouse is over / what was clicked, and draws the selection outlines. It never changes
 * the site's content, does nothing outside an iframe, and is not rendered in production
 * (see EditBridge.tsx).
 */

export interface Cand {
  tag: string;
  text: string;
  src?: string;
  href?: string;
  /** Position among elements of the same tag with identical text (to tell repeated labels apart). */
  rank?: number;
  total?: number;
}

export interface BridgeOptions {
  navigate: (path: string) => void;
  refresh: () => void;
}

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const SKIP = new Set(["HTML", "BODY", "MAIN", "SCRIPT", "STYLE", "NEXT-ROUTE-ANNOUNCER"]);

function ancestors(start: Element): Element[] {
  const out: Element[] = [];
  let el: Element | null = start;
  for (let i = 0; el && i < 7; i++, el = el.parentElement) {
    if (SKIP.has(el.tagName) || el.id === "__next" || el.hasAttribute("data-lnx-overlay")) break;
    out.push(el);
  }
  return out;
}

function describe(el: Element, withRank: boolean): Cand {
  const text = norm(el.textContent || "").slice(0, 600);
  const c: Cand = { tag: el.tagName.toLowerCase(), text };
  if (el instanceof HTMLImageElement) c.src = el.currentSrc || el.src;
  if (el instanceof HTMLAnchorElement) c.href = el.getAttribute("href") ?? undefined;
  if (withRank && text && text.length <= 200) {
    const same = [...document.querySelectorAll(c.tag)].filter((e) => norm(e.textContent || "") === text);
    c.rank = same.indexOf(el);
    c.total = same.length;
  }
  return c;
}

export function installEditBridge(opts: BridgeOptions): () => void {
  if (window.parent === window) return () => { };

  let editMode = true;
  let hoverEl: Element | null = null;
  let hoverId = 0;
  let hoverCandEls: Element[] = [];
  let clickCandEls: Element[] = [];
  let matchedHover: Element | null = null;
  let selectedEl: Element | null = null;

  const post = (m: Record<string, unknown>) => window.parent.postMessage({ source: "lnx-bridge", ...m }, "*");

  /* ── overlays ── */
  const box = (border: string, bg: string) => {
    const d = document.createElement("div");
    d.setAttribute("data-lnx-overlay", "");
    d.style.cssText = `position:fixed;pointer-events:none;z-index:2147483646;display:none;box-sizing:border-box;border:2px solid ${border};background:${bg};border-radius:4px;`;
    document.body.append(d);
    return d;
  };
  const tag = (bg: string, fg: string) => {
    const t = document.createElement("div");
    t.style.cssText = `position:absolute;left:-2px;top:-24px;max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 12px/20px system-ui,sans-serif;padding:0 8px;border-radius:4px;background:${bg};color:${fg};`;
    return t;
  };
  const hoverBox = box("#e3a361", "rgba(227,163,97,.12)");
  const hoverTag = tag("#e3a361", "#1a1208");
  hoverBox.append(hoverTag);
  const selBox = box("#7fe7c4", "rgba(127,231,168,.10)");
  const selTag = tag("#7fe7c4", "#06241a");
  selBox.append(selTag);

  const place = (b: HTMLElement, el: Element | null, t?: HTMLElement) => {
    if (!el || !el.isConnected) return void (b.style.display = "none");
    const r = el.getBoundingClientRect();
    Object.assign(b.style, { display: "block", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    if (t) t.style.top = r.top < 28 ? "2px" : "-24px";
  };
  const redraw = () => {
    place(hoverBox, editMode ? matchedHover : null, hoverTag);
    place(selBox, editMode ? selectedEl : null, selTag);
  };
  const tick = window.setInterval(redraw, 250);

  /* ── events ── */
  const onMove = (e: PointerEvent) => {
    if (!editMode) return;
    const t = e.target;
    if (!(t instanceof Element) || t === hoverEl || t.hasAttribute("data-lnx-overlay")) return;
    hoverEl = t;
    hoverCandEls = ancestors(t);
    post({ type: "hover", id: ++hoverId, cands: hoverCandEls.map((el, i) => describe(el, i === 0)) });
  };
  const onLeave = () => {
    hoverEl = null;
    matchedHover = null;
    redraw();
  };
  const onClick = (e: MouseEvent) => {
    if (!editMode || e.metaKey || e.ctrlKey || !(e.target instanceof Element)) return;
    e.preventDefault();
    e.stopPropagation();
    clickCandEls = ancestors(e.target);
    post({ type: "click", cands: clickCandEls.map((el, i) => describe(el, i === 0)) });
  };
  document.addEventListener("pointermove", onMove, true);
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("click", onClick, true);
  window.addEventListener("scroll", redraw, true);
  window.addEventListener("resize", redraw);

  const onMessage = (e: MessageEvent) => {
    const m = e.data;
    if (e.source !== window.parent || !m || m.target !== "lnx-bridge") return;
    switch (m.type) {
      case "mode":
        editMode = !!m.edit;
        if (!editMode) matchedHover = null;
        document.documentElement.toggleAttribute("data-lnx-edit", editMode);
        redraw();
        break;
      case "highlight":
        if (m.id !== hoverId) return;
        matchedHover = m.index >= 0 ? hoverCandEls[m.index] ?? null : null;
        hoverTag.textContent = m.label || "Edit";
        redraw();
        break;
      case "select":
        selectedEl = m.index >= 0 ? clickCandEls[m.index] ?? null : null;
        selTag.textContent = m.label || "Selected";
        redraw();
        break;
      case "hello": // the editor (re)connected — tell it where we are
        post({ type: "ready", path: location.pathname });
        break;
      case "navigate":
        selectedEl = null;
        opts.navigate(String(m.path));
        break;
      case "refresh":
        opts.refresh();
        break;
    }
  };
  window.addEventListener("message", onMessage);

  // Make it obvious things are clickable while editing.
  const style = document.createElement("style");
  style.setAttribute("data-lnx-overlay", "");
  style.textContent = "html[data-lnx-edit] *{cursor:pointer !important}";
  document.head.append(style);
  document.documentElement.setAttribute("data-lnx-edit", "");

  post({ type: "ready", path: location.pathname });

  return () => {
    window.clearInterval(tick);
    document.removeEventListener("pointermove", onMove, true);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("click", onClick, true);
    window.removeEventListener("scroll", redraw, true);
    window.removeEventListener("resize", redraw);
    window.removeEventListener("message", onMessage);
    hoverBox.remove();
    selBox.remove();
    style.remove();
    document.documentElement.removeAttribute("data-lnx-edit");
  };
}
