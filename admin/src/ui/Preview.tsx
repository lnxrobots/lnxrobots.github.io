"use client";
import { useEffect, useRef, useState } from "react";
import { S } from "./schema";
import { buildIndex, listPages, onPathMessage, routeForPath, type Entry, type Resolved } from "./inspect";
import { isBridgeMessage, onBridgeMessage } from "./protocol";
import { bump, getVersion, toast, ui, useStore } from "./store";

/* The website runs separately (npm run dev, port 3000) and is shown in an iframe. A small
 * dev-only bridge inside the site reports hovers/clicks; we find the data behind them. */

let frame: HTMLIFrameElement | null = null;
let siteOrigin = "";

const sendToSite = (m: Record<string, unknown>) => frame?.contentWindow?.postMessage({ target: "lnx-bridge", ...m }, siteOrigin || "*");
const bridgeUp = () => ui.bridge === "ok";
export const refreshPreview = () => sendToSite({ type: "refresh" });
export const navigatePreview = (path: string) => {
  if (bridgeUp()) sendToSite({ type: "navigate", path });
  else if (frame) frame.src = `${siteOrigin}${path}`;
};

/** The index is rebuilt only when the data changed. */
let cache: { v: number; index: Entry[] } | null = null;
const indexNow = (): Entry[] => {
  const v = getVersion();
  if (!cache || cache.v !== v) cache = { v, index: buildIndex(S.data) };
  return cache.index;
};

/** Open the editor on the field behind something clicked in the preview. */
export function selectEntry(r: Resolved) {
  const e = r.entry;
  e.chain.forEach((o) => { o._open = true; }); // expand collapsed entries so the field is visible
  const record = e.chain[e.chain.length - 1] ?? e.obj;
  ui.focus = r.container ? { obj: record, key: "" } : { obj: e.obj, key: e.key };
  ui.selection = { label: e.label, alternatives: r.alternatives, container: r.container };
  if (location.hash !== e.route) {
    ui.suppressFollow = true;
    location.hash = e.route;
  }
  bump();
}

const DEVICES = { desktop: "Desktop", tablet: "Tablet", phone: "Phone" } as const;

export default function Preview() {
  useStore();
  const ref = useRef<HTMLIFrameElement>(null);
  const [reach, setReach] = useState<"checking" | "down" | "up">("checking");
  const url = S.meta.siteUrl || "http://localhost:3000";

  useEffect(() => { siteOrigin = new URL(url).origin; }, [url]);

  // Is the website running? Keep checking until it is.
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      try {
        await fetch(url, { mode: "no-cors" });
        if (alive) setReach("up");
      } catch {
        if (alive) {
          setReach("down");
          timer = setTimeout(check, 2500);
        }
      }
    };
    check();
    return () => { alive = false; clearTimeout(timer); };
  }, [url]);

  // Messages from the bridge.
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== siteOrigin || e.source !== frame?.contentWindow || !isBridgeMessage(e.data)) return;
      const out = onBridgeMessage(e.data, { index: indexNow(), pageRoute: routeForPath(S.data, ui.pagePath) });
      switch (out.kind) {
        case "path": {
          const d = onPathMessage(S.data, { path: out.path, ready: out.ready }, { pagePath: ui.pagePath, followNav: ui.followNav, hash: location.hash });
          ui.bridge = "ok";
          ui.pagePath = out.path;
          ui.followNav = d.followNav;
          sendToSite({ type: "mode", edit: ui.editMode });
          // The person browsed to another page in the preview: bring the panel along.
          if (d.switchTo) {
            ui.suppressFollow = true;
            ui.selection = null;
            location.hash = d.switchTo;
          }
          bump();
          break;
        }
        case "hover":
          sendToSite(out.reply);
          break;
        case "hit":
          sendToSite(out.reply);
          selectEntry(out.resolved);
          break;
        case "miss":
          sendToSite(out.reply);
          toast("That isn’t a single editable field. Click the text or photo itself — or pick what to edit from the tabs.", "info", 3500);
          break;
      }
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, []);

  useEffect(() => { sendToSite({ type: "mode", edit: ui.editMode }); }, [ui.editMode]);

  // Handshake until the bridge answers; give up (with a hint) after a few seconds.
  const handshake = () => {
    ui.bridge = "waiting";
    let tries = 0;
    const t = setInterval(() => {
      if (bridgeUp()) return clearInterval(t);
      sendToSite({ type: "hello" });
      if (++tries > 12) {
        clearInterval(t);
        if (!bridgeUp()) { ui.bridge = "missing"; bump(); }
      }
    }, 500);
  };

  const pages = listPages(S.data);
  if (!pages.some((p) => p.path === ui.pagePath)) pages.push({ path: ui.pagePath, label: ui.pagePath });
  const width = ui.device === "desktop" ? "100%" : ui.device === "tablet" ? "820px" : "390px";

  return (
    <section className="stage" aria-label="Website preview">
      <div className="preview-bar">
        <select value={ui.pagePath} aria-label="Page" onChange={(e) => navigatePreview(e.target.value)}>
          {pages.map((p) => <option key={p.path} value={p.path}>{p.label}</option>)}
        </select>
        <div className="seg" role="group" aria-label="Mode">
          <button className={ui.editMode ? "on" : ""} aria-pressed={ui.editMode} onClick={() => { ui.editMode = true; bump(); }}>Edit</button>
          <button className={!ui.editMode ? "on" : ""} aria-pressed={!ui.editMode} onClick={() => { ui.editMode = false; bump(); }}>Browse</button>
        </div>
        <div className="seg" role="group" aria-label="Screen size">
          {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((d) => (
            <button key={d} className={ui.device === d ? "on" : ""} aria-pressed={ui.device === d} onClick={() => { ui.device = d; bump(); }}>{DEVICES[d]}</button>
          ))}
        </div>
        <label className="check follow" title="When you open something in the editor, show its page here">
          <input type="checkbox" checked={ui.follow} onChange={(e) => { ui.follow = e.target.checked; bump(); }} />Follow editor
        </label>
        <span className="grow" />
        <button className="icon" title="Reload the preview" aria-label="Reload the preview" onClick={() => { if (frame) frame.src = `${siteOrigin}${ui.pagePath}`; }}>⟳</button>
        <a className="icon" title="Open the page in a new tab" aria-label="Open the page in a new tab" href={`${url}${ui.pagePath}`} target="_blank" rel="noreferrer">↗</a>
      </div>

      <div className="frame-wrap">
        {reach === "up" ? (
          <>
            <iframe
              ref={(el) => { ref.current = el; frame = el; }}
              className="frame" style={{ width }} src={`${url}/`} title="The LNX Robots website"
              onLoad={() => { sendToSite({ type: "hello" }); handshake(); }}
            />
            {ui.bridge === "missing" && (
              <div className="bridge-warn" role="alert">
                <strong>The page loaded, but the edit bridge isn’t answering.</strong>
                <span>Click-to-edit needs the small <code>EditBridge</code> component in the site’s <code>layout.tsx</code> (and the site running with <code>npm run dev</code>, not a build). See “Connect the site” in <code>admin/README.md</code>. You can still use the editor on the left.</span>
              </div>
            )}
          </>
        ) : (
          <div className="stage-msg">
            <h2>{reach === "checking" ? "Connecting to the website…" : "The website isn’t running"}</h2>
            {reach === "down" && (
              <>
                <p>The preview shows your real site. Start it in a second terminal:</p>
                <pre className="cmd">npm run dev</pre>
                <p className="help">This panel connects by itself as soon as {url} answers. You can keep editing on the left meanwhile.</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
